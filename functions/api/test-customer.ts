import { json } from '@cloudflare/workers-types';

export async function onRequestPost(context: any) {
  const { env } = context;
  
  if (!env.DB) {
    return json({ error: 'Database not available' }, { status: 500 });
  }

  try {
    // Create a test customer
    const result = await env.DB.prepare(`
      INSERT OR REPLACE INTO customers (id, email, name, created_at, is_premium, extension_activated, total_spent, total_orders)
      VALUES (1, 'test@example.com', 'Test User', datetime('now'), 1, 1, 29.99, 1)
    `).run();

    // Create a test order
    await env.DB.prepare(`
      INSERT OR REPLACE INTO orders (id, customer_id, original_amount, final_amount, status, created_at, payment_method)
      VALUES (1, 1, 2999, 2999, 'completed', datetime('now'), 'stripe')
    `).run();

    // Create a test activation code
    await env.DB.prepare(`
      INSERT OR REPLACE INTO activation_codes (id, customer_id, code, created_at, is_used)
      VALUES (1, 1, 'TEST-ACTIVATION-CODE', datetime('now'), 1)
    `).run();

    // Create a test invoice
    await env.DB.prepare(`
      INSERT OR REPLACE INTO invoices (id, customer_id, order_id, amount, status, created_at, paid_at)
      VALUES (1, 1, 1, 2999, 'paid', datetime('now'), datetime('now'))
    `).run();

    return json({ 
      success: true, 
      message: 'Test customer created successfully',
      customer: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        isPremium: true
      }
    });

  } catch (error: any) {
    console.error('Error creating test customer:', error);
    return json({ error: error.message }, { status: 500 });
  }
}
