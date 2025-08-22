import { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  try {
    // Update the banner price directly in countdown_banners table
    const updateResult = await env.DB.prepare(`
      UPDATE countdown_banners 
      SET targetPrice = '1.00'
      WHERE id = 1
    `).run();

    // Verify the update
    const updatedBanner = await env.DB.prepare(`
      SELECT id, targetPrice, originalPrice FROM countdown_banners WHERE id = 1
    `).first();

    return new Response(JSON.stringify({
      success: true,
      message: 'Banner price updated to €1.00',
      updateResult: {
        success: updateResult.success,
        meta: updateResult.meta
      },
      banner: updatedBanner
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update banner price',
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
