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

    // If no user identification provided, return a default guest user
    if (!extractedUserId && !userEmail) {
      return json({
        id: 0,
        email: 'guest@example.com',
        name: 'Guest User',
        role: 'guest',
        createdAt: new Date().toISOString(),
        isAuthenticated: false
      });
    }

    // Check if D1 database is available
    if (!env.DB) {
      console.error('D1 database not available');
      // Return guest user if database is not available
      return json({
        id: 0,
        email: 'guest@example.com',
        name: 'Guest User',
        role: 'guest',
        createdAt: new Date().toISOString(),
        isAuthenticated: false
      });
    }

    let user: User | null = null;

    try {
      // Try multiple table and column combinations to handle different schema versions
      if (extractedUserId) {
        // Try customers table first with different column name variations
        try {
          const customerResult = await env.DB.prepare(`
            SELECT id, email, name, 'customer' as role, created_at 
            FROM customers WHERE id = ?
          `).bind(parseInt(extractedUserId)).first();
          user = customerResult as unknown as User;
        } catch (e) {
          // Try with different column names if first attempt fails
          try {
            const customerResult = await env.DB.prepare(`
              SELECT id, email, name, 'customer' as role, createdAt as created_at 
              FROM customers WHERE id = ?
            `).bind(parseInt(extractedUserId)).first();
            user = customerResult as unknown as User;
          } catch (e2) {
            console.log('Customers table query failed, trying users table');
          }
        }
      } else if (userEmail) {
        try {
          const customerResult = await env.DB.prepare(`
            SELECT id, email, name, 'customer' as role, created_at 
            FROM customers WHERE email = ?
          `).bind(userEmail).first();
          user = customerResult as unknown as User;
        } catch (e) {
          try {
            const customerResult = await env.DB.prepare(`
              SELECT id, email, name, 'customer' as role, createdAt as created_at 
              FROM customers WHERE email = ?
            `).bind(userEmail).first();
            user = customerResult as unknown as User;
          } catch (e2) {
            console.log('Customers table query failed, trying users table');
          }
        }
      }

      // Fallback to users table if not found in customers
      if (!user) {
        if (extractedUserId) {
          try {
            const userResult = await env.DB.prepare(`
              SELECT id, email, username as name, 'admin' as role, created_at 
              FROM users WHERE id = ?
            `).bind(parseInt(extractedUserId)).first();
            user = userResult as unknown as User;
          } catch (e) {
            try {
              const userResult = await env.DB.prepare(`
                SELECT id, email, username as name, 'admin' as role, createdAt as created_at 
                FROM users WHERE id = ?
              `).bind(parseInt(extractedUserId)).first();
              user = userResult as unknown as User;
            } catch (e2) {
              console.log('Users table query also failed');
            }
          }
        } else if (userEmail) {
          try {
            const userResult = await env.DB.prepare(`
              SELECT id, email, username as name, 'admin' as role, created_at 
              FROM users WHERE email = ?
            `).bind(userEmail).first();
            user = userResult as unknown as User;
          } catch (e) {
            try {
              const userResult = await env.DB.prepare(`
                SELECT id, email, username as name, 'admin' as role, createdAt as created_at 
                FROM users WHERE email = ?
              `).bind(userEmail).first();
              user = userResult as unknown as User;
            } catch (e2) {
              console.log('Users table query also failed');
            }
          }
        }
      }

      // If still no user found, return a default user with the provided info
      if (!user) {
        return json({
          id: extractedUserId ? parseInt(extractedUserId) : 0,
          email: userEmail || 'unknown@example.com',
          name: 'Unknown User',
          role: 'customer',
          createdAt: new Date().toISOString(),
          isAuthenticated: false
        });
      }

      // Return user profile
      return json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'customer',
        createdAt: user.created_at || new Date().toISOString(),
        isAuthenticated: true
      });

    } catch (dbError: any) {
      console.error('Database error in /api/me:', dbError);
      // Return fallback user instead of error
      return json({
        id: extractedUserId ? parseInt(extractedUserId) : 0,
        email: userEmail || 'fallback@example.com',
        name: 'Fallback User',
        role: 'customer',
        createdAt: new Date().toISOString(),
        isAuthenticated: false
      });
    }

  } catch (error: any) {
    console.error('Error in /api/me:', error);
    // Return fallback user instead of error
    return json({
      id: 0,
      email: 'error@example.com',
      name: 'Error User',
      role: 'guest',
      createdAt: new Date().toISOString(),
      isAuthenticated: false
    });
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
