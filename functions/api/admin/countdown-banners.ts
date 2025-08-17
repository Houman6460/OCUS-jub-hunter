import { SettingsStorage } from '../../lib/settings-storage';

interface Env {
  DB: D1Database;
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const settingsStorage = new SettingsStorage(context.env.DB);
    
    // Get all countdown banners from storage
    const bannersData = await settingsStorage.getSetting('countdown_banners');
    const banners = bannersData ? JSON.parse(bannersData) : [];
    
    console.log('Retrieved countdown banners:', banners.length);
    
    return new Response(JSON.stringify({ banners }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching countdown banners:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch countdown banners',
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const settingsStorage = new SettingsStorage(context.env.DB);
    const requestData = await context.request.json();
    
    console.log('Creating new countdown banner:', requestData);
    
    // Create new banner
    const newBanner: CountdownBanner = {
      id: crypto.randomUUID(),
      title: requestData.title || '',
      subtitle: requestData.subtitle || '',
      targetPrice: parseFloat(requestData.targetPrice) || 0,
      originalPrice: parseFloat(requestData.originalPrice) || 0,
      endDate: requestData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: requestData.priority || 1,
      backgroundColor: requestData.backgroundColor || '#007cba',
      textColor: requestData.textColor || '#ffffff',
      isActive: requestData.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Get existing banners
    const existingBannersData = await settingsStorage.getSetting('countdown_banners');
    const existingBanners = existingBannersData ? JSON.parse(existingBannersData) : [];
    
    // Add new banner
    existingBanners.push(newBanner);
    
    // Save updated banners
    await settingsStorage.setSetting('countdown_banners', JSON.stringify(existingBanners));
    
    console.log('Created countdown banner:', newBanner.id);
    
    return new Response(JSON.stringify({ banner: newBanner }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error creating countdown banner:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create countdown banner',
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
    const requestData = await context.request.json();
    const bannerId = requestData.id;
    
    if (!bannerId) {
      return new Response(JSON.stringify({ error: 'Banner ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    console.log('Updating countdown banner:', bannerId);
    
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
      ...requestData,
      targetPrice: requestData.targetPrice ? parseFloat(requestData.targetPrice) : existingBanners[bannerIndex].targetPrice,
      originalPrice: requestData.originalPrice ? parseFloat(requestData.originalPrice) : existingBanners[bannerIndex].originalPrice,
      updatedAt: new Date().toISOString(),
    };
    
    // Save updated banners
    await settingsStorage.setSetting('countdown_banners', JSON.stringify(existingBanners));
    
    console.log('Updated countdown banner:', bannerId);
    
    return new Response(JSON.stringify({ banner: existingBanners[bannerIndex] }), {
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
    const url = new URL(context.request.url);
    const bannerId = url.searchParams.get('id');
    
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
