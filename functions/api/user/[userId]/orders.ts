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
        customerEmail as customer_email,
        customerName as customer_name,
        productId as product_id,
        originalAmount as original_amount,
        finalAmount as final_amount,
        currency,
        status,
        paymentMethod as payment_method,
        downloadToken as download_token,
        downloadCount as download_count,
        maxDownloads as max_downloads,
        activationCode as activation_code,
        createdAt as created_at,
        completedAt as completed_at
      FROM orders 
      WHERE customerEmail = (SELECT email FROM users WHERE id = ?)
      ORDER BY createdAt DESC
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
