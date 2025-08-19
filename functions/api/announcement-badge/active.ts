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

interface FrontendBadgeData {
  id: string;
  isEnabled: boolean;
  textEn: string;
  textTranslations: Record<string, string>;
  backgroundColor: string;
  textColor: string;
  priority: number;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const settingsStorage = new SettingsStorage(context.env.DB);
    
    // Get all announcement badges from storage
    const badgesData = await settingsStorage.getSetting('announcement_badges');
    const badges: AnnouncementBadge[] = badgesData ? JSON.parse(badgesData) : [];
    
    console.log('Retrieved announcement badges for active endpoint:', badges.length);
    
    // Find the highest priority active badge
    const activeBadge = badges
      .filter(badge => badge.isActive)
      .sort((a, b) => b.priority - a.priority)[0];
    
    if (!activeBadge) {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Transform backend data structure to frontend expected format
    const frontendBadge: FrontendBadgeData = {
      id: activeBadge.id,
      isEnabled: activeBadge.isActive,
      textEn: activeBadge.title,
      textTranslations: (activeBadge as any).textTranslations || {},
      backgroundColor: activeBadge.backgroundColor,
      textColor: activeBadge.textColor,
      priority: activeBadge.priority,
    };
    
    console.log('Returning active badge:', frontendBadge);
    
    return new Response(JSON.stringify(frontendBadge), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching active announcement badge:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch active announcement badge',
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
