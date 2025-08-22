interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { params } = context;
    const userId = params.userId as string;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch user orders from database
    const ordersQuery = `
      SELECT 
        id,
        customer_email,
        customer_name,
        product_id,
        original_amount,
        final_amount,
        currency,
        status,
        payment_method,
        download_token,
        download_count,
        max_downloads,
        activation_code,
        created_at,
        completed_at
      FROM orders 
      WHERE customer_id = ? 
      ORDER BY created_at DESC
    `;

    const ordersResult = await context.env.DB.prepare(ordersQuery).bind(userId).all();
    
    return new Response(JSON.stringify(ordersResult.results || []), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
