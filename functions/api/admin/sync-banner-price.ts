import { PagesFunction } from '@cloudflare/workers-types';
import { SettingsStorage } from '../../lib/settings-storage';

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { targetPrice } = await request.json();
    
    if (!targetPrice) {
      return new Response(JSON.stringify({ error: 'targetPrice is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const settingsStorage = new SettingsStorage(env.DB);
    
    // Update settings table (admin dashboard storage)
    const bannersData = await settingsStorage.getSetting('countdown_banners');
    let banners = bannersData ? JSON.parse(bannersData) : [];
    
    if (banners.length === 0) {
      // Create default banner in settings
      banners = [{
        id: '1',
        title: 'Limited Time Offer!',
        subtitle: 'Get OCUS Job Hunter Extension at Special Price',
        targetPrice: parseFloat(targetPrice),
        originalPrice: 299.99,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 1,
        backgroundColor: '#FF6B35',
        textColor: '#FFFFFF',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }];
    } else {
      // Update existing banner
      banners[0].targetPrice = parseFloat(targetPrice);
      banners[0].updatedAt = new Date().toISOString();
    }
    
    await settingsStorage.setSetting('countdown_banners', JSON.stringify(banners));
    
    // Also update countdown_banners table if record exists
    try {
      await env.DB.prepare(`
        UPDATE countdown_banners 
        SET targetPrice = ?, updatedAt = datetime('now')
        WHERE id = 1
      `).bind(targetPrice).run();
    } catch (dbError) {
      console.warn('Failed to update countdown_banners table:', dbError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Banner price synced successfully',
      targetPrice: parseFloat(targetPrice)
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to sync banner price',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
