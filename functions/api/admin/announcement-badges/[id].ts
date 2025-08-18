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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const settingsStorage = new SettingsStorage(context.env.DB);
    const badgeId = context.params.id;
    
    if (!badgeId) {
      return new Response(JSON.stringify({ error: 'Badge ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Get all badges
    const badgesData = await settingsStorage.getSetting('announcement_badges');
    const badges = badgesData ? JSON.parse(badgesData) : [];
    
    // Find specific badge
    const badge = badges.find((b: AnnouncementBadge) => b.id === badgeId);
    
    if (!badge) {
      return new Response(JSON.stringify({ error: 'Badge not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    return new Response(JSON.stringify(badge), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching announcement badge:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch announcement badge',
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
    const badgeId = context.params.id;
    const requestData = await context.request.json();
    
    if (!badgeId) {
      return new Response(JSON.stringify({ error: 'Badge ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    console.log('Updating announcement badge:', badgeId, JSON.stringify(requestData, null, 2));
    
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
      title: requestData.title || requestData.text || requestData.badgeText || requestData.content || requestData.message || existingBadges[badgeIndex].title,
      subtitle: requestData.subtitle || existingBadges[badgeIndex].subtitle,
      backgroundColor: requestData.backgroundColor || requestData.bgColor || requestData.background || existingBadges[badgeIndex].backgroundColor,
      textColor: requestData.textColor || requestData.color || requestData.foreground || existingBadges[badgeIndex].textColor,
      priority: requestData.priority ? parseInt(requestData.priority) : existingBadges[badgeIndex].priority,
      isActive: requestData.isActive !== undefined ? Boolean(requestData.isActive) : requestData.enabled !== undefined ? Boolean(requestData.enabled) : existingBadges[badgeIndex].isActive,
      updatedAt: new Date().toISOString(),
    };
    
    console.log('Updated badge object:', JSON.stringify(existingBadges[badgeIndex], null, 2));
    
    // Save updated badges
    await settingsStorage.setSetting('announcement_badges', JSON.stringify(existingBadges));
    
    console.log('Updated announcement badge:', badgeId);
    
    return new Response(JSON.stringify(existingBadges[badgeIndex]), {
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
    const badgeId = context.params.id;
    
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
