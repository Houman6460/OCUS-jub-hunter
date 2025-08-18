import { SettingsStorage } from '../../../lib/settings-storage';

interface Env {
  DB: D1Database;
}

declare global {
  interface D1Database {}
  interface PagesFunction<T = any> {
    (context: { request: Request; env: T; params: any; waitUntil: (promise: Promise<any>) => void; }): Promise<Response> | Response;
  }
}

interface CountdownBanner {
  id: string;
  title: string;
  subtitle: string;
  targetPrice: number;
  originalPrice: number;
  endDate: string;
  priority: number;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const settingsStorage = new SettingsStorage(context.env.DB);
    const bannerId = context.params.id;
    
    if (!bannerId) {
      return new Response(JSON.stringify({ error: 'Banner ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Get all banners
    const bannersData = await settingsStorage.getSetting('countdown_banners');
    const banners = bannersData ? JSON.parse(bannersData) : [];
    
    // Find specific banner
    const banner = banners.find((b: CountdownBanner) => b.id === bannerId);
    
    if (!banner) {
      return new Response(JSON.stringify({ error: 'Banner not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    return new Response(JSON.stringify(banner), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching countdown banner:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch countdown banner',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const settingsStorage = new SettingsStorage(context.env.DB);
    const bannerId = context.params.id;
    const requestData = await context.request.json();
    
    if (!bannerId) {
      return new Response(JSON.stringify({ error: 'Banner ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    console.log('Updating countdown banner:', bannerId, requestData);
    
    // Get existing banners
    const existingBannersData = await settingsStorage.getSetting('countdown_banners');
    const existingBanners = existingBannersData ? JSON.parse(existingBannersData) : [];
    
    // Find and update banner
    const bannerIndex = existingBanners.findIndex((banner: CountdownBanner) => banner.id === bannerId);
    
    if (bannerIndex === -1) {
      return new Response(JSON.stringify({ error: 'Banner not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Update banner
    existingBanners[bannerIndex] = {
      ...existingBanners[bannerIndex],
      title: requestData.title || existingBanners[bannerIndex].title,
      subtitle: requestData.subtitle || existingBanners[bannerIndex].subtitle,
      targetPrice: requestData.targetPrice ? parseFloat(requestData.targetPrice) : existingBanners[bannerIndex].targetPrice,
      originalPrice: requestData.originalPrice ? parseFloat(requestData.originalPrice) : existingBanners[bannerIndex].originalPrice,
      endDate: requestData.endDate || existingBanners[bannerIndex].endDate,
      priority: requestData.priority ? parseInt(requestData.priority) : existingBanners[bannerIndex].priority,
      backgroundColor: requestData.backgroundColor || existingBanners[bannerIndex].backgroundColor,
      textColor: requestData.textColor || existingBanners[bannerIndex].textColor,
      isActive: requestData.isActive !== undefined ? requestData.isActive : existingBanners[bannerIndex].isActive,
      updatedAt: new Date().toISOString(),
    };
    
    // Save updated banners
    await settingsStorage.setSetting('countdown_banners', JSON.stringify(existingBanners));
    
    console.log('Updated countdown banner:', bannerId);
    
    return new Response(JSON.stringify(existingBanners[bannerIndex]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error updating countdown banner:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to update countdown banner',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const settingsStorage = new SettingsStorage(context.env.DB);
    const bannerId = context.params.id;
    
    if (!bannerId) {
      return new Response(JSON.stringify({ error: 'Banner ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    console.log('Deleting countdown banner:', bannerId);
    
    // Get existing banners
    const existingBannersData = await settingsStorage.getSetting('countdown_banners');
    const existingBanners = existingBannersData ? JSON.parse(existingBannersData) : [];
    
    // Filter out the banner to delete
    const updatedBanners = existingBanners.filter((banner: CountdownBanner) => banner.id !== bannerId);
    
    if (updatedBanners.length === existingBanners.length) {
      return new Response(JSON.stringify({ error: 'Banner not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Save updated banners
    await settingsStorage.setSetting('countdown_banners', JSON.stringify(updatedBanners));
    
    console.log('Deleted countdown banner:', bannerId);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error deleting countdown banner:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to delete countdown banner',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
