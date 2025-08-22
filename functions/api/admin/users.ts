import { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    // Fetch all users for admin dashboard
    const users = await env.DB.prepare(`
      SELECT 
        id, email, name, isActive, isPremium, 
        registrationDate, lastLoginAt, createdAt
      FROM users 
      ORDER BY createdAt DESC
    `).all();

    // Get user statistics
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN isActive = 1 THEN 1 END) as activeUsers,
        COUNT(CASE WHEN isPremium = 1 THEN 1 END) as premiumUsers
      FROM users
    `).first();

    return new Response(JSON.stringify({
      success: true,
      users: users.results || [],
      stats: stats || {
        totalUsers: 0,
        activeUsers: 0,
        premiumUsers: 0
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error fetching admin users:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch users',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
