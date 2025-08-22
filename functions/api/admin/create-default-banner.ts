import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../lib/context';

export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  try {
    // Check if there's already an active banner
    const existingBanner = await env.DB.prepare(`
      SELECT id FROM countdown_banners 
      WHERE isActive = 1 
      LIMIT 1
    `).first();

    if (existingBanner) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Active banner already exists',
        bannerId: existingBanner.id
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Create a default countdown banner for testing
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // 7 days from now

    const result = await env.DB.prepare(`
      INSERT INTO countdown_banners (
        title, subtitle, targetPrice, originalPrice, endDate, 
        priority, backgroundColor, textColor, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      'Limited Time Offer!',
      'Get OCUS Job Hunter Extension at Special Price',
      199.99,
      299.99,
      endDate.toISOString(),
      1,
      '#FF6B35',
      '#FFFFFF',
      1
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Default countdown banner created successfully',
      bannerId: result.meta.last_row_id
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error creating default banner:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create default banner',
      details: error instanceof Error ? error.message : 'Unknown error'
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
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
