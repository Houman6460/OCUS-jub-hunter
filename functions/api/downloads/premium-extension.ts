import { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const downloadToken = url.searchParams.get('token');

    if (!downloadToken) {
      return new Response(JSON.stringify({ error: 'Download token is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Verify download token and get order
    const order = await env.DB.prepare(`
      SELECT * FROM orders 
      WHERE downloadToken = ? AND status = 'completed'
    `).bind(downloadToken).first();

    if (!order) {
      return new Response(JSON.stringify({ error: 'Invalid or expired download token' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Check download limits
    if (Number(order.downloadCount) >= Number(order.maxDownloads)) {
      return new Response(JSON.stringify({ 
        error: 'Download limit exceeded',
        maxDownloads: order.maxDownloads,
        currentDownloads: order.downloadCount
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Update download count
    await env.DB.prepare(`
      UPDATE orders 
      SET downloadCount = downloadCount + 1 
      WHERE downloadToken = ?
    `).bind(downloadToken).run();

    // Log the download
    console.log(`Premium extension downloaded for order ${order.id}, download count: ${Number(order.downloadCount) + 1}`);

    // Return the extension file (this would be the actual file in production)
    // For now, return a success response with download info
    return new Response(JSON.stringify({
      success: true,
      message: 'Premium extension download authorized',
      orderId: order.id,
      downloadCount: Number(order.downloadCount) + 1,
      maxDownloads: Number(order.maxDownloads),
      activationCode: order.activationCode
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error processing download:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to process download',
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
