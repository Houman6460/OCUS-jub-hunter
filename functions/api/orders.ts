// Simple orders API for customer purchase history
import { Env } from '../lib/context';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const url = new URL(request.url);
  const customerId = url.searchParams.get('customerId');

  if (!env.DB) {
    return json({ error: 'Database not available' }, 500);
  }

  try {
    // Initialize orders table
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

    // Create demo order if none exists
    if (customerId) {
      const existingOrders = await env.DB.prepare('SELECT COUNT(*) as count FROM orders WHERE user_id = ?')
        .bind(parseInt(customerId)).first();
      
      if ((existingOrders as any)?.count === 0) {
        const now = new Date().toISOString();
        await env.DB.prepare(`
          INSERT INTO orders (
            user_id, customer_email, customer_name, product_id,
            original_amount, final_amount, currency, status, payment_method,
            download_token, activation_code, created_at, completed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          parseInt(customerId),
          'demo@example.com',
          'Demo User',
          'premium-extension',
          29.99,
          29.99,
          'USD',
          'completed',
          'stripe',
          'demo-download-token',
          'demo-activation-code',
          now,
          now
        ).run();
      }
    }

    // Fetch orders
    let query = 'SELECT * FROM orders ORDER BY created_at DESC';
    let params: any[] = [];

    if (customerId) {
      query = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
      params = [parseInt(customerId)];
    }

    const result = await env.DB.prepare(query).bind(...params).all();
    const orders = result.results || [];

    return json(orders);
  } catch (error: any) {
    console.error('Orders API error:', error);
    return json({ error: 'Database query failed', details: error.message }, 500);
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
