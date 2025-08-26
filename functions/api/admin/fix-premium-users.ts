// Fix premium activation for existing users who have completed purchases
export const onRequestPost = async ({ request, env }: any) => {
  try {
    const body = await request.json() as { adminKey?: string };
    
    // Simple admin key check
    if (body.adminKey !== 'fix-premium-2024') {
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
      return new Response(JSON.stringify({
        success: false,
        message: 'Database not available'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const results = {
      usersChecked: 0,
      customersChecked: 0,
      usersFixed: 0,
      customersFixed: 0,
      errors: []
    };

    // Get all customers with completed paid orders but missing premium flags
    const customersWithOrders = await env.DB.prepare(`
      SELECT DISTINCT c.id, c.email, c.name, c.is_premium, c.extension_activated,
             COUNT(o.id) as orderCount, SUM(o.final_amount) as totalPaid
      FROM customers c
      JOIN orders o ON c.id = o.customer_id
      WHERE o.status = 'completed' AND o.final_amount > 0
      GROUP BY c.id, c.email, c.name, c.is_premium, c.extension_activated
    `).all();

    console.log('Found customers with completed orders:', customersWithOrders.results?.length);

    for (const customer of customersWithOrders.results || []) {
      results.customersChecked++;
      
      // Check if customer needs premium flags updated
      const needsUpdate = customer.is_premium !== 1 || customer.extension_activated !== 1;
      
      if (needsUpdate) {
        try {
          await env.DB.prepare(`
            UPDATE customers 
            SET is_premium = 1, extension_activated = 1, premium_activated_at = datetime('now')
            WHERE id = ?
          `).bind(customer.id).run();
          
          results.customersFixed++;
          console.log(`Fixed customer ${customer.email} (ID: ${customer.id})`);
        } catch (error) {
          results.errors.push(`Failed to fix customer ${customer.email}: ${error.message}`);
        }
      }
    }

    // Get all users with completed paid orders but missing premium flags
    const usersWithOrders = await env.DB.prepare(`
      SELECT DISTINCT u.id, u.email, u.name, u.is_premium, u.extension_activated,
             COUNT(o.id) as orderCount, SUM(o.final_amount) as totalPaid
      FROM users u
      JOIN orders o ON u.email = o.customer_email
      WHERE o.status = 'completed' AND o.final_amount > 0
      GROUP BY u.id, u.email, u.name, u.is_premium, u.extension_activated
    `).all();

    console.log('Found users with completed orders:', usersWithOrders.results?.length);

    for (const user of usersWithOrders.results || []) {
      results.usersChecked++;
      
      // Check if user needs premium flags updated
      const needsUpdate = user.is_premium !== 1 || user.extension_activated !== 1;
      
      if (needsUpdate) {
        try {
          await env.DB.prepare(`
            UPDATE users 
            SET is_premium = 1, extension_activated = 1, premium_activated_at = datetime('now')
            WHERE id = ?
          `).bind(user.id).run();
          
          results.usersFixed++;
          console.log(`Fixed user ${user.email} (ID: ${user.id})`);
        } catch (error) {
          results.errors.push(`Failed to fix user ${user.email}: ${error.message}`);
        }
      }
    }

    // Create activation codes for customers who don't have them
    const customersNeedingCodes = await env.DB.prepare(`
      SELECT c.id, c.email
      FROM customers c
      WHERE c.is_premium = 1 AND c.extension_activated = 1
      AND NOT EXISTS (
        SELECT 1 FROM activation_codes ac WHERE ac.customer_id = c.id
      )
    `).all();

    let codesCreated = 0;
    for (const customer of customersNeedingCodes.results || []) {
      try {
        const activationCode = `OCUS-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        
        await env.DB.prepare(`
          INSERT INTO activation_codes (customer_id, code, created_at)
          VALUES (?, ?, datetime('now'))
        `).bind(customer.id, activationCode).run();
        
        codesCreated++;
        console.log(`Created activation code for customer ${customer.email}`);
      } catch (error) {
        results.errors.push(`Failed to create activation code for ${customer.email}: ${error.message}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Premium activation fix completed',
      results: {
        ...results,
        activationCodesCreated: codesCreated
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error: any) {
    console.error('Error fixing premium users:', error);
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
