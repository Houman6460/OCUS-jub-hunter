import { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const customerEmail = url.searchParams.get('email');

    if (!customerEmail) {
      return new Response(JSON.stringify({ error: 'Email parameter is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    let orders = [];

    try {
      // Try to fetch from orders table first
      const orderResults = await env.DB.prepare(`
        SELECT * FROM orders 
        WHERE customerEmail = ? 
        ORDER BY createdAt DESC
      `).bind(customerEmail).all();
      orders = orderResults.results || [];
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
          if (orderData.customerEmail === customerEmail) {
            allOrders.push(orderData);
          }
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
    }

    return new Response(JSON.stringify({
      success: true,
      orders: orders
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
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
