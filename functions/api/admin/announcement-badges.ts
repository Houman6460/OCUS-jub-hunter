import { SettingsStorage } from '../../lib/settings-storage';

interface Env {
  DB: D1Database;
}

declare global {
  interface D1Database {}
  interface PagesFunction<T = any> {
    (context: { request: Request; env: T; params: any; waitUntil: (promise: Promise<any>) => void; }): Promise<Response> | Response;
  }
}

interface AnnouncementBadge {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  priority: number;
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
    
    // Get all announcement badges from storage
    const badgesData = await settingsStorage.getSetting('announcement_badges');
    const badges = badgesData ? JSON.parse(badgesData) : [];
    
    console.log('Retrieved announcement badges:', badges.length);
    
    return new Response(JSON.stringify(badges), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching announcement badges:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch announcement badges',
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
    
    console.log('Creating new announcement badge:', requestData);
    
    // Create new badge - handle different field names from frontend
    const newBadge: AnnouncementBadge = {
      id: crypto.randomUUID(),
      title: requestData.title || requestData.text || requestData.badgeText || '',
      subtitle: requestData.subtitle || '',
      backgroundColor: requestData.backgroundColor || requestData.bgColor || '#007cba',
      textColor: requestData.textColor || requestData.color || '#ffffff',
      priority: parseInt(requestData.priority) || 1,
      isActive: requestData.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Get existing badges
    const existingBadgesData = await settingsStorage.getSetting('announcement_badges');
    const existingBadges = existingBadgesData ? JSON.parse(existingBadgesData) : [];
    
    // Add new badge
    existingBadges.push(newBadge);
    
    // Save updated badges
    await settingsStorage.setSetting('announcement_badges', JSON.stringify(existingBadges));
    
    console.log('Created announcement badge:', newBadge.id);
    
    return new Response(JSON.stringify({ badge: newBadge }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error creating announcement badge:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create announcement badge',
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
    const badgeId = requestData.id;
    
    if (!badgeId) {
      return new Response(JSON.stringify({ error: 'Badge ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    console.log('Updating announcement badge:', badgeId);
    
    // Get existing badges
    const existingBadgesData = await settingsStorage.getSetting('announcement_badges');
    const existingBadges = existingBadgesData ? JSON.parse(existingBadgesData) : [];
    
    // Find and update badge
    const badgeIndex = existingBadges.findIndex((badge: AnnouncementBadge) => badge.id === badgeId);
    
    if (badgeIndex === -1) {
      return new Response(JSON.stringify({ error: 'Badge not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Update badge - handle different field names from frontend
    existingBadges[badgeIndex] = {
      ...existingBadges[badgeIndex],
      title: requestData.title || requestData.text || requestData.badgeText || existingBadges[badgeIndex].title,
      subtitle: requestData.subtitle || existingBadges[badgeIndex].subtitle,
      backgroundColor: requestData.backgroundColor || requestData.bgColor || existingBadges[badgeIndex].backgroundColor,
      textColor: requestData.textColor || requestData.color || existingBadges[badgeIndex].textColor,
      priority: requestData.priority ? parseInt(requestData.priority) : existingBadges[badgeIndex].priority,
      isActive: requestData.isActive !== undefined ? requestData.isActive : existingBadges[badgeIndex].isActive,
      updatedAt: new Date().toISOString(),
    };
    
    // Save updated badges
    await settingsStorage.setSetting('announcement_badges', JSON.stringify(existingBadges));
    
    console.log('Updated announcement badge:', badgeId);
    
    return new Response(JSON.stringify({ badge: existingBadges[badgeIndex] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error updating announcement badge:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to update announcement badge',
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
    const badgeId = url.searchParams.get('id');
    
    if (!badgeId) {
      return new Response(JSON.stringify({ error: 'Badge ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    console.log('Deleting announcement badge:', badgeId);
    
    // Get existing badges
    const existingBadgesData = await settingsStorage.getSetting('announcement_badges');
    const existingBadges = existingBadgesData ? JSON.parse(existingBadgesData) : [];
    
    // Filter out the badge to delete
    const updatedBadges = existingBadges.filter((badge: AnnouncementBadge) => badge.id !== badgeId);
    
    if (updatedBadges.length === existingBadges.length) {
      return new Response(JSON.stringify({ error: 'Badge not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Save updated badges
    await settingsStorage.setSetting('announcement_badges', JSON.stringify(updatedBadges));
    
    console.log('Deleted announcement badge:', badgeId);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error deleting announcement badge:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to delete announcement badge',
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
