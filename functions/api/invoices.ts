// D1 Database-based invoice system
import { Env } from '../lib/context';

interface Invoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  order_id?: number;
  customer_email: string;
  customer_name: string;
  amount: number;
  currency: string;
  status: string;
  invoice_date: string;
  due_date?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Map D1 invoice to UI shape expected by client
function mapToUi(inv: Invoice) {
  return {
    id: inv.id,
    invoiceNumber: inv.invoice_number,
    customerId: inv.customer_id,
    customerName: inv.customer_name,
    customerEmail: inv.customer_email,
    invoiceDate: inv.invoice_date,
    dueDate: inv.due_date,
    subtotal: inv.amount.toString(),
    totalAmount: inv.amount.toString(),
    currency: inv.currency.toUpperCase(),
    status: inv.status,
    paidAt: inv.paid_at,
    notes: inv.notes || '',
  };
}

// Initialize invoices table if it doesn't exist
async function initializeInvoicesTable(db: any) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL,
        order_id INTEGER,
        customer_email TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD' NOT NULL,
        status TEXT DEFAULT 'issued' NOT NULL,
        invoice_date TEXT NOT NULL,
        due_date TEXT,
        paid_at TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `).run();
  } catch (error) {
    console.error('Failed to initialize invoices table:', error);
  }
}

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const url = new URL(request.url);
  const customerId = url.searchParams.get('customerId');
  const isAdmin = url.searchParams.get('isAdmin') === 'true';

  // Check if D1 database is available
  if (!env.DB) {
    console.error('D1 database not available');
    return json({ error: 'Database not available' }, 500);
  }

  try {
    // Initialize invoices table
    await initializeInvoicesTable(env.DB);

    let query = 'SELECT * FROM invoices ORDER BY created_at DESC';
    let params: any[] = [];

    if (!isAdmin && customerId) {
      // Customer sees only their own invoices
      query = 'SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC';
      params = [parseInt(customerId)];
    }

    const result = await env.DB.prepare(query).bind(...params).all();
    const invoices = (result.results as unknown as Invoice[]) || [];

    // If no invoices exist, create a demo invoice for testing
    if (invoices.length === 0 && customerId) {
      const now = new Date().toISOString();
      const demoInvoiceNumber = `INV-${new Date().getFullYear()}-000001`;
      
      await env.DB.prepare(`
        INSERT INTO invoices (
          invoice_number, customer_id, customer_email, customer_name,
          amount, currency, status, invoice_date, paid_at, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        demoInvoiceNumber,
        parseInt(customerId),
        'demo@example.com',
        'Demo Customer',
        49.99,
        'USD',
        'paid',
        now,
        now,
        'Demo invoice for testing',
        now
      ).run();

      // Fetch the updated list
      const updatedResult = await env.DB.prepare(query).bind(...params).all();
      const updatedInvoices = (updatedResult.results as unknown as Invoice[]) || [];
      return json(updatedInvoices.map(mapToUi));
    }

    return json(invoices.map(mapToUi));
  } catch (error: any) {
    console.error('Database error:', error);
    return json({ error: 'Database query failed', details: error.message }, 500);
  }
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const body = await request.json() as any;
    const {
      customerId,
      customerName,
      customerEmail,
      notes,
      items,
      currency = 'USD',
    } = body;

    if (!customerId || !customerName || !customerEmail || !Array.isArray(items) || items.length === 0) {
      return json({ success: false, message: 'Missing required fields' }, 400);
    }

    // Check if D1 database is available
    if (!env.DB) {
      console.error('D1 database not available');
      return json({ success: false, message: 'Database not available' }, 500);
    }

    // Initialize invoices table
    await initializeInvoicesTable(env.DB);

    // Compute totals
    const subtotalNum = items.reduce((sum: number, it: any) => {
      const qty = Number(it.quantity || 0);
      const price = Number(it.unitPrice || 0);
      return sum + qty * price;
    }, 0);

    const now = new Date();
    const invoiceDate = now.toISOString();
    const dueDate = new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString();
    
    // Get next invoice number
    const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM invoices').first();
    const invoiceCount = (countResult as any)?.count || 0;
    const invoiceNumber = `INV-${now.getFullYear()}-${String(invoiceCount + 1).padStart(6, '0')}`;

    // Insert invoice into database
    const result = await env.DB.prepare(`
      INSERT INTO invoices (
        invoice_number, customer_id, customer_email, customer_name,
        amount, currency, status, invoice_date, due_date, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      invoiceNumber,
      parseInt(customerId),
      customerEmail,
      customerName,
      subtotalNum,
      currency.toUpperCase(),
      'issued',
      invoiceDate,
      dueDate,
      notes || '',
      invoiceDate
    ).run();

    const invoiceId = result.meta?.last_row_id as number;

    // Fetch the created invoice
    const createdInvoice = await env.DB.prepare('SELECT * FROM invoices WHERE id = ?')
      .bind(invoiceId)
      .first() as unknown as Invoice;

    return json({ success: true, invoice: mapToUi(createdInvoice) }, 201);
  } catch (e: any) {
    console.error('Failed to create invoice:', e);
    return json({ success: false, message: 'Failed to create invoice', error: e.message }, 500);
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
