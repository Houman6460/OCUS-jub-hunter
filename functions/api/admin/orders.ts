import { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    // Fetch all orders for admin dashboard
    const orders = await env.DB.prepare(`
      SELECT * FROM orders 
      ORDER BY createdAt DESC
    `).all();

    // Get order statistics
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as totalOrders,
        SUM(CASE WHEN status = 'completed' THEN finalAmount ELSE 0 END) as totalRevenue,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingOrders
      FROM orders
    `).first();

    return new Response(JSON.stringify({
      success: true,
      orders: orders.results || [],
      stats: stats || {
        totalOrders: 0,
        totalRevenue: 0,
        completedOrders: 0,
        pendingOrders: 0
      }
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
