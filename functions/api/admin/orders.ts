import { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    let orders = [];
    let stats = {
      totalOrders: 0,
      totalRevenue: 0,
      completedOrders: 0,
      pendingOrders: 0
    };

    try {
      // Try to fetch from orders table first
      const orderResults = await env.DB.prepare(`
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
        ORDER BY createdAt DESC
      `).all();
      orders = orderResults.results || [];

      // Get order statistics
      const statsResult = await env.DB.prepare(`
        SELECT 
          COUNT(*) as totalOrders,
          SUM(CASE WHEN status = 'completed' THEN CAST(finalAmount as REAL) ELSE 0 END) as totalRevenue,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingOrders
        FROM orders
      `).first();
      if (statsResult) {
        stats = {
          totalOrders: Number(statsResult.totalOrders) || 0,
          totalRevenue: Number(statsResult.totalRevenue) || 0,
          completedOrders: Number(statsResult.completedOrders) || 0,
          pendingOrders: Number(statsResult.pendingOrders) || 0
        };
      }
    } catch (dbError) {
      console.log('Orders table not found, checking fallback storage:', dbError);
      
      // Fallback: Get orders from settings table
      const settingsResults = await env.DB.prepare(`
        SELECT key, value FROM settings 
        WHERE key LIKE 'order_%'
      `).all();
      
      const allOrders = [];
      for (const setting of (settingsResults.results || [])) {
        try {
          const orderData = JSON.parse(setting.value as string);
          allOrders.push(orderData);
        } catch (parseError) {
          console.log('Error parsing order data:', parseError);
        }
      }
      
      // Sort by completedAt or createdAt
      orders = allOrders.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.createdAt);
        const dateB = new Date(b.completedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Calculate stats from fallback data
      stats.totalOrders = orders.length;
      stats.completedOrders = orders.filter(o => o.status === 'completed').length;
      stats.pendingOrders = orders.filter(o => o.status === 'pending').length;
      stats.totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (parseFloat(o.finalAmount) || 0), 0);
    }

    return new Response(JSON.stringify({
      success: true,
      orders: orders,
      stats: stats
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch orders',
      details: String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
