export async function onRequestGet(context: any) {
  const { env } = context;
  
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Create invoices table
    await env.DB.prepare(`
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
        created_at TEXT NOT NULL
      )
    `).run();

    // Insert demo invoice
    const now = new Date().toISOString();
    const invoiceNumber = `INV-2025-000001`;
    
    await env.DB.prepare(`
      INSERT OR REPLACE INTO invoices (
        invoice_number, customer_id, customer_email, customer_name,
        amount, currency, status, invoice_date, paid_at, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      invoiceNumber,
      1,
      'demo@example.com',
      'Demo User',
      29.99,
      'USD',
      'paid',
      now,
      now,
      'Premium extension purchase',
      now
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Demo invoice created' }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
