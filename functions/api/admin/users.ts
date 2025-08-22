import { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    let users = [];
    let stats = {
      totalUsers: 0,
      activeUsers: 0,
      premiumUsers: 0
    };

    try {
      // Fetch users with download and purchase information
      const userResults = await env.DB.prepare(`
        SELECT 
          u.id, 
          u.email, 
          u.name, 
          u.role,
          u.created_at,
          u.is_premium,
          u.premium_activated_at,
          u.total_spent,
          u.total_orders,
          u.extension_activated,
          COUNT(DISTINCT d.id) as trial_downloads,
          COUNT(DISTINCT o.id) as purchase_count,
          MAX(d.created_at) as last_download,
          MAX(o.created_at) as last_purchase
        FROM users u
        LEFT JOIN user_downloads d ON u.id = d.user_id
        LEFT JOIN orders o ON u.id = o.customer_id AND o.status = 'completed'
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `).all();
      users = userResults.results || [];

      // Get user statistics
      const statsResult = await env.DB.prepare(`
        SELECT 
          COUNT(*) as totalUsers,
          COUNT(CASE WHEN is_premium = 1 THEN 1 END) as premiumUsers,
          COUNT(DISTINCT d.user_id) as trialUsers
        FROM users u
        LEFT JOIN user_downloads d ON u.id = d.user_id
      `).first();
      
      if (statsResult) {
        stats = {
          totalUsers: Number(statsResult.totalUsers) || 0,
          activeUsers: Number(statsResult.trialUsers) || 0,
          premiumUsers: Number(statsResult.premiumUsers) || 0
        };
      }
    } catch (dbError) {
      console.log('Users table not found, checking fallback storage:', dbError);
      
      // Fallback: Get users from settings table
      const settingsResults = await env.DB.prepare(`
        SELECT key, value FROM settings 
        WHERE key LIKE 'user_%'
      `).all();
      
      const allUsers = [];
      for (const setting of (settingsResults.results || [])) {
        try {
          const userData = JSON.parse(setting.value as string);
          // Add an ID based on email for consistency
          userData.id = userData.email.replace('@', '_at_').replace('.', '_dot_');
          userData.registrationDate = userData.updatedAt;
          userData.createdAt = userData.updatedAt;
          userData.isActive = true;
          allUsers.push(userData);
        } catch (parseError) {
          console.log('Error parsing user data:', parseError);
        }
      }
      
      // Sort by updatedAt
      users = allUsers.sort((a, b) => {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Calculate stats from fallback data
      stats.totalUsers = users.length;
      stats.activeUsers = users.filter(u => u.isActive).length;
      stats.premiumUsers = users.filter(u => u.isPremium).length;
    }

    return new Response(JSON.stringify({
      success: true,
      users: users,
      stats: stats
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
