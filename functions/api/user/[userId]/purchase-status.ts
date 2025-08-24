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

    // Get user email first
    const userQuery = `SELECT email FROM users WHERE id = ?`;
    const userResult = await context.env.DB.prepare(userQuery).bind(userId).first();
    
    if (!userResult) {
      return new Response(JSON.stringify({ 
        hasPurchased: false,
        totalSpent: '0.00',
        completedOrders: 0,
        lastPurchaseDate: null
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Get purchase status from orders
    const statusQuery = `
      SELECT 
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
        SUM(CASE WHEN status = 'completed' THEN CAST(finalAmount as REAL) ELSE 0 END) as totalSpent,
        MAX(CASE WHEN status = 'completed' THEN createdAt END) as lastPurchaseDate
      FROM orders 
      WHERE customerEmail = ?
    `;

    const statusResult = await context.env.DB.prepare(statusQuery).bind(userResult.email).first();
    
    const hasPurchased = (statusResult?.completedOrders || 0) > 0;
    const totalSpent = (statusResult?.totalSpent || 0).toFixed(2);
    const completedOrders = statusResult?.completedOrders || 0;
    const lastPurchaseDate = statusResult?.lastPurchaseDate ? new Date(statusResult.lastPurchaseDate).getTime() : null;

    return new Response(JSON.stringify({
      hasPurchased,
      totalSpent,
      completedOrders,
      lastPurchaseDate
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Error fetching purchase status:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch purchase status',
      hasPurchased: false,
      totalSpent: '0.00',
      completedOrders: 0,
      lastPurchaseDate: null
    }), {
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
