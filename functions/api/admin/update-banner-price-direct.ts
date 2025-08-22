import { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    // Update banner ID 1 to have price of 1.00
    const result = await env.DB.prepare(`
      UPDATE countdown_banners 
      SET targetPrice = '1.00' 
      WHERE id = 1
    `).run();

    // Verify the update
    const banner = await env.DB.prepare(`
      SELECT * FROM countdown_banners WHERE id = 1
    `).first();

    return new Response(JSON.stringify({
      success: true,
      message: 'Banner price updated to €1.00',
      updated: result.changes > 0,
      banner: banner
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
      error: 'Failed to update banner price',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
