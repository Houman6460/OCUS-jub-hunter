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

    // Get the highest priority active countdown banner
    const result = await env.DB.prepare(`
      SELECT * FROM countdown_banners 
      WHERE isActive = 1 
      ORDER BY priority DESC, createdAt DESC 
      LIMIT 1
    `).first<CountdownBanner>();

    if (!result) {
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
      if (result.titleTranslations) {
        titleTranslations = JSON.parse(result.titleTranslations);
      }
    } catch (e) {
      console.warn('Failed to parse titleTranslations:', e);
    }
    
    try {
      if (result.subtitleTranslations) {
        subtitleTranslations = JSON.parse(result.subtitleTranslations);
      }
    } catch (e) {
      console.warn('Failed to parse subtitleTranslations:', e);
    }

    // Transform the data to match frontend expectations
    const transformedBanner = {
      id: parseInt(result.id) || 0,
      isEnabled: result.isActive,
      titleEn: result.title,
      subtitleEn: result.subtitle,
      titleTranslations,
      subtitleTranslations,
      targetPrice: result.targetPrice.toString(),
      originalPrice: result.originalPrice ? result.originalPrice.toString() : undefined,
      endDateTime: result.endDate, // Frontend expects endDateTime
      backgroundColor: result.backgroundColor,
      textColor: result.textColor,
      priority: result.priority,
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
