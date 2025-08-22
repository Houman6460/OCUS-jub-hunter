import { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

interface CountdownBanner {
  id: string;
  title: string;
  subtitle: string;
  titleTranslations?: string;
  subtitleTranslations?: string;
  targetPrice: number;
  originalPrice?: number;
  endDate: string;
  priority: number;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env } = context;

    // First check if there are banners in the countdown_banners table
    const banner = await env.DB.prepare(`
      SELECT * FROM countdown_banners 
      WHERE isActive = 1 
      ORDER BY priority DESC, id ASC 
      LIMIT 1
    `).first();

    // If no banner found in countdown_banners table, check settings table as fallback
    if (!banner) {
      try {
        const settingsStorage = new (await import('../../lib/settings-storage')).SettingsStorage(env.DB);
        const bannersData = await settingsStorage.getSetting('countdown_banners');
        if (bannersData) {
          const banners = JSON.parse(bannersData);
          const activeBanner = banners.find((b: any) => b.isActive);
          if (activeBanner) {
            // Convert settings format to countdown_banners table format
            return new Response(JSON.stringify({
              id: activeBanner.id || 1,
              isEnabled: activeBanner.isActive ? 1 : 0,
              titleEn: activeBanner.title || 'Limited Time Offer!',
              subtitleEn: activeBanner.subtitle || 'Get OCUS Job Hunter Extension at Special Price',
              titleTranslations: activeBanner.titleTranslations || {},
              subtitleTranslations: activeBanner.subtitleTranslations || {},
              targetPrice: String(activeBanner.targetPrice || '1.00'),
              originalPrice: String(activeBanner.originalPrice || '299.99'),
              endDateTime: activeBanner.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              backgroundColor: activeBanner.backgroundColor || '#FF6B35',
              textColor: activeBanner.textColor || '#FFFFFF',
              priority: activeBanner.priority || 1
            }), {
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
        }
      } catch (settingsError) {
        console.warn('Failed to check settings table for banners:', settingsError);
      }
    }

    if (!banner) {
      return new Response(JSON.stringify({ message: 'No active countdown banner found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Parse translations if they exist
    let titleTranslations = {};
    let subtitleTranslations = {};
    
    try {
      if (banner.titleTranslations && typeof banner.titleTranslations === 'string') {
        titleTranslations = JSON.parse(banner.titleTranslations);
      }
    } catch (e) {
      console.warn('Failed to parse titleTranslations:', e);
    }
    
    try {
      if (banner.subtitleTranslations && typeof banner.subtitleTranslations === 'string') {
        subtitleTranslations = JSON.parse(banner.subtitleTranslations);
      }
    } catch (e) {
      console.warn('Failed to parse subtitleTranslations:', e);
    }

    // Transform the data to match frontend expectations
    const transformedBanner = {
      id: parseInt(String(banner.id)) || 0,
      isEnabled: banner.isActive,
      titleEn: banner.title,
      subtitleEn: banner.subtitle,
      titleTranslations,
      subtitleTranslations,
      targetPrice: String(banner.targetPrice || '1.00'),
      originalPrice: banner.originalPrice ? String(banner.originalPrice) : undefined,
      endDateTime: banner.endDate, // Frontend expects endDateTime
      backgroundColor: banner.backgroundColor,
      textColor: banner.textColor,
      priority: banner.priority,
    };

    return new Response(JSON.stringify(transformedBanner), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error fetching active countdown banner:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch active countdown banner',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
};

// Handle OPTIONS requests for CORS
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
