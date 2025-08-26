// Fix premium activation for all users who have completed purchases
export const onRequestPost = async ({ request, env }: any) => {
  try {
    const body = await request.json() as { email?: string; adminKey?: string };
    const { email, adminKey } = body;
    
    // Simple admin check
    if (adminKey !== 'fix-premium-2024') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid admin key'
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({ success: false, message: 'Database not available' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const results = {
      usersFixed: 0,
      customersFixed: 0,
      errors: []
    };

    // Fix specific user if email provided, otherwise fix all
    if (email) {
      // Fix specific user
      const user = await env.DB.prepare(`
        SELECT u.id, u.email, COUNT(o.id) as orderCount, SUM(o.final_amount) as totalPaid
        FROM users u
        LEFT JOIN orders o ON u.email = o.customer_email AND o.status = 'completed' AND o.final_amount > 0
        WHERE u.email = ?
        GROUP BY u.id, u.email
      `).bind(email).first();

      if (user && user.orderCount > 0) {
        await env.DB.prepare(`
          UPDATE users 
          SET is_premium = 1, extension_activated = 1, premium_activated_at = datetime('now')
          WHERE id = ?
        `).bind(user.id).run();
        results.usersFixed++;
      }

      // Also check customers table
      const customer = await env.DB.prepare(`
        SELECT c.id, c.email, COUNT(o.id) as orderCount, SUM(o.final_amount) as totalPaid
        FROM customers c
        LEFT JOIN orders o ON c.id = o.customer_id AND o.status = 'completed' AND o.final_amount > 0
        WHERE c.email = ?
        GROUP BY c.id, c.email
      `).bind(email).first();

      if (customer && customer.orderCount > 0) {
        await env.DB.prepare(`
          UPDATE customers 
          SET is_premium = 1, extension_activated = 1, premium_activated_at = datetime('now')
          WHERE id = ?
        `).bind(customer.id).run();
        results.customersFixed++;
      }
    } else {
      // Fix all users with completed orders
      const usersToFix = await env.DB.prepare(`
        SELECT DISTINCT u.id, u.email
        FROM users u
        JOIN orders o ON u.email = o.customer_email
        WHERE o.status = 'completed' AND o.final_amount > 0
        AND (u.is_premium != 1 OR u.extension_activated != 1)
      `).all();

      for (const user of usersToFix.results || []) {
        await env.DB.prepare(`
          UPDATE users 
          SET is_premium = 1, extension_activated = 1, premium_activated_at = datetime('now')
          WHERE id = ?
        `).bind(user.id).run();
        results.usersFixed++;
      }

      const customersToFix = await env.DB.prepare(`
        SELECT DISTINCT c.id, c.email
        FROM customers c
        JOIN orders o ON c.id = o.customer_id
        WHERE o.status = 'completed' AND o.final_amount > 0
        AND (c.is_premium != 1 OR c.extension_activated != 1)
      `).all();

      for (const customer of customersToFix.results || []) {
        await env.DB.prepare(`
          UPDATE customers 
          SET is_premium = 1, extension_activated = 1, premium_activated_at = datetime('now')
          WHERE id = ?
        `).bind(customer.id).run();
        results.customersFixed++;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Premium activation fix completed`,
      results
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error: any) {
    console.error('Error fixing premium activation:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
