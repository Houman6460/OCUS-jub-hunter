export async function onRequestGet(context: any) {
  const { env } = context;
  
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const now = new Date().toISOString();
    
    // Force create and populate all tables
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_premium BOOLEAN DEFAULT 0,
        extension_activated BOOLEAN DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0,
        total_orders INTEGER DEFAULT 0
      )
    `).run();

    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL,
        customer_email TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD' NOT NULL,
        status TEXT DEFAULT 'issued' NOT NULL,
        invoice_date TEXT NOT NULL,
        paid_at TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
      )
    `).run();

    // Force insert demo data
    await env.DB.prepare(`
      INSERT OR REPLACE INTO customers (id, email, name, is_premium, extension_activated, total_spent, total_orders, created_at)
      VALUES (1, 'demo@example.com', 'Demo User', 1, 1, 29.99, 1, ?)
    `).bind(now).run();

    await env.DB.prepare(`
      INSERT OR REPLACE INTO invoices (id, invoice_number, customer_id, customer_email, customer_name, amount, currency, status, invoice_date, paid_at, notes, created_at)
      VALUES (1, 'INV-2025-000001', 1, 'demo@example.com', 'Demo User', 29.99, 'USD', 'paid', ?, ?, 'Premium extension purchase', ?)
    `).bind(now, now, now).run();

    // Test queries
    const customer = await env.DB.prepare('SELECT * FROM customers WHERE id = 1').first();
    const invoices = await env.DB.prepare('SELECT * FROM invoices WHERE customer_id = 1').all();

    return new Response(JSON.stringify({
      success: true,
      customer: customer,
      invoices: invoices.results,
      timestamp: now
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
