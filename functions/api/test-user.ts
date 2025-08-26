// Simple test endpoint to check user data
export const onRequestPost = async ({ request, env }: any) => {
  try {
    const body = await request.json() as { email?: string };
    const email = body.email || 'heshmat@gmail.com';

    if (!env.DB) {
      return new Response(JSON.stringify({ success: false, message: 'Database not available' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Check users table
    const user = await env.DB.prepare(`
      SELECT id, email, name, is_premium, extension_activated, premium_activated_at, created_at
      FROM users WHERE email = ?
    `).bind(email).first();

    // Check customers table
    const customer = await env.DB.prepare(`
      SELECT id, email, name, is_premium, extension_activated, created_at
      FROM customers WHERE email = ?
    `).bind(email).first();

    // Check orders for both user_id and customer_id
    const ordersUserQuery = await env.DB.prepare(`
      SELECT id, customer_id, customer_email, original_amount, final_amount, status, created_at, completed_at
      FROM orders WHERE customer_email = ?
    `).bind(email).all();

    const ordersCustomerQuery = customer ? await env.DB.prepare(`
      SELECT id, customer_id, customer_email, original_amount, final_amount, status, created_at, completed_at
      FROM orders WHERE customer_id = ?
    `).bind(customer.id).all() : { results: [] };

    return new Response(JSON.stringify({
      success: true,
      email,
      user,
      customer,
      ordersFromEmail: ordersUserQuery.results,
      ordersFromCustomerId: ordersCustomerQuery.results,
      summary: {
        userExists: !!user,
        customerExists: !!customer,
        userPremium: user?.is_premium === 1,
        customerPremium: customer?.is_premium === 1,
        userExtensionActivated: user?.extension_activated === 1,
        customerExtensionActivated: customer?.extension_activated === 1,
        totalOrdersFromEmail: ordersUserQuery.results?.length || 0,
        totalOrdersFromCustomerId: ordersCustomerQuery.results?.length || 0
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error: any) {
    console.error('Error checking user data:', error);
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
