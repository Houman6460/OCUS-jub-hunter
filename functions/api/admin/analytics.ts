interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // Get real analytics data from database
    const ordersStatsQuery = `
      SELECT 
        COUNT(*) as totalOrders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
        SUM(CASE WHEN status = 'completed' THEN CAST(final_amount as REAL) ELSE 0 END) as totalRevenue
      FROM orders
    `;

    const usersStatsQuery = `
      SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN is_premium = 1 THEN 1 END) as premiumUsers
      FROM users
    `;

    const [ordersStats, usersStats] = await Promise.all([
      context.env.DB.prepare(ordersStatsQuery).first(),
      context.env.DB.prepare(usersStatsQuery).first()
    ]);

    const analytics = {
      totalRevenue: Number(ordersStats?.totalRevenue) || 0,
      totalSales: Number(ordersStats?.completedOrders) || 0,
      activeCustomers: Number(usersStats?.totalUsers) || 0,
      avgRating: 4.9 // Static rating
    };
    
    return new Response(JSON.stringify({
      success: true,
      ...analytics
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Failed to get analytics:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to load analytics',
      totalRevenue: 0,
      totalSales: 0,
      activeCustomers: 0,
      avgRating: 4.9
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
