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
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  customer_email: string;
  customer_name: string;
  assigned_to_user_id?: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  message: string;
  is_from_customer: boolean;
  sender_name: string;
  sender_email?: string;
  created_at: string;
}

export class TicketStorage {
  constructor(private db: D1Database) {}

  async getAllTickets(): Promise<Ticket[]> {
    const result = await this.db.prepare('SELECT * FROM tickets ORDER BY created_at DESC').all();
    return result.results as Ticket[];
  }

  async getTicketsByCustomerEmail(email: string): Promise<Ticket[]> {
    const result = await this.db.prepare('SELECT * FROM tickets WHERE customer_email = ? ORDER BY created_at DESC')
      .bind(email)
      .all();
    return result.results as Ticket[];
  }

  async getTicketById(id: number): Promise<Ticket | null> {
    const result = await this.db.prepare('SELECT * FROM tickets WHERE id = ?')
      .bind(id)
      .first();
    return result as Ticket | null;
  }

  async createTicket(ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>): Promise<Ticket> {
    const now = new Date().toISOString();
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
    
    return result as Ticket;
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
      INSERT INTO ticket_messages (ticket_id, message, is_from_customer, sender_name, sender_email, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      message.ticket_id,
      message.message,
      message.is_from_customer ? 1 : 0,
      message.sender_name,
      message.sender_email || null,
      now
    ).first();

    // Update ticket timestamp
    await this.db.prepare('UPDATE tickets SET updated_at = ? WHERE id = ?')
      .bind(now, message.ticket_id)
      .run();

    return result as TicketMessage;
  }
}
