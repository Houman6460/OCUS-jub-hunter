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

    // Fetch user orders
    const orders = await env.DB.prepare(`
      SELECT * FROM orders 
      WHERE customerEmail = ? 
      ORDER BY createdAt DESC
    `).bind(customerEmail).all();

    return new Response(JSON.stringify({
      success: true,
      orders: orders.results || []
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
