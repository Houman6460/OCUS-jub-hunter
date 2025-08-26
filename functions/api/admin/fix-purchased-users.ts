// Cloudflare Pages Function: /api/admin/fix-purchased-users
// Fix users who have purchased but don't have premium access

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../lib/context';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json() as { emails: string[] };
    const { emails } = body;

    if (!emails || !Array.isArray(emails)) {
      return json({ success: false, message: 'Array of emails required' }, 400);
    }

    if (!env.DB) {
      return json({ success: false, message: 'Database not available' }, 500);
    }

    const now = new Date().toISOString();
    const results = [];

    for (const email of emails) {
      try {
        // Check if user exists in users table
        const user = await env.DB.prepare(`
          SELECT id, email, name FROM users WHERE email = ?
        `).bind(email).first();

        if (user) {
          // Update user premium status like heshmat@gmail.com
          await env.DB.prepare(`
            UPDATE users 
            SET is_premium = 1,
                extension_activated = 1,
                premium_activated_at = ?
            WHERE email = ?
          `).bind(now, email).run();

          results.push({
            email,
            status: 'updated',
            message: 'User premium status activated'
          });
        } else {
          results.push({
            email,
            status: 'not_found',
            message: 'User not found in users table'
          });
        }
      } catch (error: any) {
        results.push({
          email,
          status: 'error',
          message: error.message
        });
      }
    }

    return json({
      success: true,
      message: 'Batch update completed',
      results
    });

  } catch (error: any) {
    console.error('Error fixing purchased users:', error);
    return json({ 
      success: false, 
      message: error.message 
    }, 500);
  }
};
