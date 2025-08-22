import { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { bannerId, targetPrice } = await request.json() as { bannerId: number; targetPrice: number };

    // Update the banner price
    const result = await env.DB.prepare(`
      UPDATE countdown_banners 
      SET targetPrice = ? 
      WHERE id = ?
    `).bind(targetPrice.toString(), bannerId).run();

    if (result.changes === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Banner not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Banner price updated successfully',
      bannerId,
      newPrice: targetPrice
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error updating banner price:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update banner price'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

// Handle CORS preflight requests
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
