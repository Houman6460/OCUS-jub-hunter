// Database initialization endpoint to force create all tables and demo data
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
    
    // Force create customers table
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

    // Force create invoices table
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

    // Force create orders table
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        customer_email TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        product_id TEXT NOT NULL,
        original_amount DECIMAL(10,2) NOT NULL,
        final_amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD' NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL,
        payment_method TEXT,
        download_token TEXT,
        download_count INTEGER DEFAULT 0,
        max_downloads INTEGER DEFAULT 3,
        activation_code TEXT,
        created_at TEXT NOT NULL,
        completed_at TEXT
      )
    `).run();

    // Force insert demo customer
    await env.DB.prepare(`
      INSERT OR REPLACE INTO customers (id, email, name, is_premium, extension_activated, total_spent, total_orders, created_at)
      VALUES (1, 'demo@example.com', 'Demo User', 1, 1, 29.99, 1, ?)
    `).bind(now).run();

    // Force insert demo invoice
    await env.DB.prepare(`
      INSERT OR REPLACE INTO invoices (id, invoice_number, customer_id, customer_email, customer_name, amount, currency, status, invoice_date, paid_at, notes, created_at)
      VALUES (1, 'INV-2025-000001', 1, 'demo@example.com', 'Demo User', 29.99, 'USD', 'paid', ?, ?, 'Premium extension purchase', ?)
    `).bind(now, now, now).run();

    // Force insert demo order
    await env.DB.prepare(`
      INSERT OR REPLACE INTO orders (id, user_id, customer_email, customer_name, product_id, original_amount, final_amount, currency, status, payment_method, download_token, activation_code, created_at, completed_at)
      VALUES (1, 1, 'demo@example.com', 'Demo User', 'premium-extension', 29.99, 29.99, 'USD', 'completed', 'stripe', 'demo-download-token', 'demo-activation-code', ?, ?)
    `).bind(now, now).run();

    // Verify data was inserted
    const customer = await env.DB.prepare('SELECT * FROM customers WHERE id = 1').first();
    const invoice = await env.DB.prepare('SELECT * FROM invoices WHERE customer_id = 1').first();
    const order = await env.DB.prepare('SELECT * FROM orders WHERE user_id = 1').first();

    return new Response(JSON.stringify({
      success: true,
      message: 'Database initialized successfully',
      data: {
        customer: customer,
        invoice: invoice,
        order: order
      },
      timestamp: now
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
