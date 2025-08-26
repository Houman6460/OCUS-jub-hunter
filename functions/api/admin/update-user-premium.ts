// Cloudflare Pages Function: /api/admin/update-user-premium
// Updates user premium status for testing

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
    const body = await request.json() as { userId: number; isPremium: boolean };
    const { userId, isPremium } = body;

    if (!env.DB) {
      return json({ success: false, message: 'Database not available' }, 500);
    }

    const now = new Date().toISOString();

    // Update users table
    await env.DB.prepare(`
      UPDATE users 
      SET is_premium = ?,
          extension_activated = ?,
          premium_activated_at = ?
      WHERE id = ?
    `).bind(isPremium ? 1 : 0, isPremium ? 1 : 0, isPremium ? now : null, userId).run();

    return json({ 
      success: true, 
      message: `User ${userId} premium status updated to ${isPremium}` 
    });

  } catch (error: any) {
    console.error('Error updating user premium status:', error);
    return json({ 
      success: false, 
      message: error.message 
    }, 500);
  }
};
