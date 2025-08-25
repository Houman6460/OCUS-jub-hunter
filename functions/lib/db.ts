// D1 Database helper for Cloudflare Functions

// D1Database type definition for Cloudflare Workers
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T[]>>;
  raw<T = unknown>(): Promise<T[]>;
}

interface D1Result<T = unknown> {
  results: T;
  success: boolean;
  meta: any;
  error?: string;
}

interface D1ExecResult {
  count: number;
  duration: number;
}

export interface Env {
  DB: D1Database;
  EXPRESS_API_BASE?: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'archived';
  customer_email: string;
  customer_name: string;
  assigned_to_user_id?: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  archived_at?: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  message: string;
  is_from_customer: boolean;
  sender_name: string;
  sender_email?: string;
  created_at: string;
  attachments?: string;
}

export class TicketStorage {
  constructor(private db: D1Database) {}

  async getAllTickets(): Promise<Ticket[]> {
    try {
      const result = await this.db.prepare('SELECT * FROM tickets ORDER BY created_at DESC').all();
      return result.results as Ticket[];
    } catch (error: any) {
      console.error('D1 getAllTickets error:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  async getTicketsByCustomerEmail(email: string): Promise<Ticket[]> {
    try {
      const result = await this.db.prepare('SELECT * FROM tickets WHERE customer_email = ? ORDER BY created_at DESC')
        .bind(email)
        .all();
      return result.results as Ticket[];
    } catch (error: any) {
      console.error('D1 getTicketsByCustomerEmail error:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  async getTicketsByCustomerId(customerId: number): Promise<Ticket[]> {
    try {
      // First get the customer's email from the customers table
      const customerResult = await this.db.prepare('SELECT email FROM customers WHERE id = ?')
        .bind(customerId)
        .first();
      
      if (!customerResult) {
        return [];
      }
      
      const customerEmail = (customerResult as any).email;
      return await this.getTicketsByCustomerEmail(customerEmail);
    } catch (error: any) {
      console.error('D1 getTicketsByCustomerId error:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  async getTicketById(id: number): Promise<Ticket | null> {
    const result = await this.db.prepare('SELECT * FROM tickets WHERE id = ?')
      .bind(id)
      .first();
    return result as Ticket | null;
  }

  async createTicket(ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>): Promise<Ticket> {
    const now = new Date().toISOString();
    
    try {
      const result = await this.db.prepare(`
        INSERT INTO tickets (title, description, category, priority, status, customer_email, customer_name, assigned_to_user_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `).bind(
        ticket.title,
        ticket.description,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.customer_email,
        ticket.customer_name,
        ticket.assigned_to_user_id || null,
        now,
        now
      ).first();
      
      if (!result) {
        throw new Error('Failed to insert ticket - no result returned');
      }
      
      return result as Ticket;
    } catch (error: any) {
      console.error('D1 createTicket error:', error);
      throw new Error(`Database insert failed: ${error.message}`);
    }
  }

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket | null> {
    const now = new Date().toISOString();
    
    try {
      const result = await this.db.prepare(`
        UPDATE tickets 
        SET title = COALESCE(?, title),
            description = COALESCE(?, description),
            category = COALESCE(?, category),
            priority = COALESCE(?, priority),
            status = COALESCE(?, status),
            assigned_to_user_id = COALESCE(?, assigned_to_user_id),
            updated_at = ?,
            resolved_at = CASE WHEN ? = 'resolved' THEN ? ELSE resolved_at END,
            archived_at = CASE WHEN ? = 'archived' THEN ? ELSE archived_at END
        WHERE id = ?
        RETURNING *
      `).bind(
        updates.title || null,
        updates.description || null,
        updates.category || null,
        updates.priority || null,
        updates.status || null,
        updates.assigned_to_user_id || null,
        now,
        updates.status,
        updates.status === 'resolved' ? now : null,
        updates.status,
        updates.status === 'archived' ? now : null,
        id
      ).first();
      
      return result as Ticket | null;
    } catch (error: any) {
      console.error('D1 updateTicket error:', error);
      throw new Error(`Database update failed: ${error.message}`);
    }
  }

  async archiveTicket(id: number): Promise<Ticket | null> {
    const now = new Date().toISOString();
    
    try {
      const result = await this.db.prepare(`
        UPDATE tickets 
        SET status = 'archived',
            archived_at = ?,
            updated_at = ?
        WHERE id = ?
        RETURNING *
      `).bind(now, now, id).first();
      
      return result as Ticket | null;
    } catch (error: any) {
      console.error('D1 archiveTicket error:', error);
      throw new Error(`Database archive failed: ${error.message}`);
    }
  }

  async updateTicketStatus(id: number, status: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.prepare('UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?')
      .bind(status, now, id)
      .run();
  }

  async deleteTicket(id: number): Promise<void> {
    // Delete messages first due to foreign key constraint
    await this.db.prepare('DELETE FROM ticket_messages WHERE ticket_id = ?').bind(id).run();
    await this.db.prepare('DELETE FROM tickets WHERE id = ?').bind(id).run();
  }

  async getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
    const result = await this.db.prepare('SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC')
      .bind(ticketId)
      .all();
    return result.results as TicketMessage[];
  }

  async addTicketMessage(message: Omit<TicketMessage, 'id' | 'created_at'>): Promise<TicketMessage> {
    const now = new Date().toISOString();
    
    // Insert message
    const result = await this.db.prepare(`
      INSERT INTO ticket_messages (ticket_id, message, is_from_customer, sender_name, sender_email, created_at, attachments)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      message.ticket_id,
      message.message,
      message.is_from_customer ? 1 : 0,
      message.sender_name,
      message.sender_email || null,
      now,
      message.attachments || null
    ).first();

    // Update ticket timestamp
    await this.db.prepare('UPDATE tickets SET updated_at = ? WHERE id = ?')
      .bind(now, message.ticket_id)
      .run();

    return result as TicketMessage;
  }
}
