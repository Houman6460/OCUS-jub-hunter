import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    // Get user ID from query params or headers
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || url.searchParams.get('id');
    const userEmail = url.searchParams.get('email');
    
    // Check authorization header for user info
    const authHeader = request.headers.get('Authorization');
    let extractedUserId = userId;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract user ID from token if needed
      const token = authHeader.substring(7);
      // For now, assume token contains user ID directly
      if (!extractedUserId && token) {
        extractedUserId = token;
      }
    }

    if (!extractedUserId && !userEmail) {
      return json({ error: 'User identification required' }, 401);
    }

    // Check if D1 database is available
    if (!env.DB) {
      console.error('D1 database not available');
      return json({ error: 'Database not available' }, 500);
    }

    let user: User | null = null;

    try {
      // First try customers table since that's the primary user table
      if (extractedUserId) {
        const customerResult = await env.DB.prepare(`
          SELECT id, email, name, 'customer' as role, created_at 
          FROM customers WHERE id = ?
        `).bind(parseInt(extractedUserId)).first();
        user = customerResult as unknown as User;
      } else if (userEmail) {
        const customerResult = await env.DB.prepare(`
          SELECT id, email, name, 'customer' as role, created_at 
          FROM customers WHERE email = ?
        `).bind(userEmail).first();
        user = customerResult as unknown as User;
      }

      // Fallback to users table if not found in customers
      if (!user) {
        if (extractedUserId) {
          const userResult = await env.DB.prepare(`
            SELECT id, email, username as name, 'admin' as role, created_at 
            FROM users WHERE id = ?
          `).bind(parseInt(extractedUserId)).first();
          user = userResult as unknown as User;
        } else if (userEmail) {
          const userResult = await env.DB.prepare(`
            SELECT id, email, username as name, 'admin' as role, created_at 
            FROM users WHERE email = ?
          `).bind(userEmail).first();
          user = userResult as unknown as User;
        }
      }

      if (!user) {
        return json({ error: 'User not found' }, 404);
      }

      // Return user profile
      return json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'customer',
        createdAt: user.created_at,
        isAuthenticated: true
      });

    } catch (dbError: any) {
      console.error('Database error in /api/me:', dbError);
      return json({
        error: 'Failed to fetch user profile',
        details: dbError.message
      }, 500);
    }

  } catch (error: any) {
    console.error('Error in /api/me:', error);
    return json({
      error: 'Internal server error',
      details: error.message
    }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
};
