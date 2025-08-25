// Cloudflare Pages Function: /api/extension/check/[id]
// Handles extension status check

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../../lib/context';

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

export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
  try {
        const paramId = params.id as string;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ canUse: false, reason: 'Not authenticated' });
    }

    const token = authHeader.substring(7);

    // Handle demo user
    if (token === 'demo-jwt-token' && paramId === '1') {
      return json({
        canUse: true,
        reason: 'Premium access',
        trialUsed: 0,
        isBlocked: false
      });
    }

    // For real users, verify token and check database
    if (token.startsWith('jwt-token-')) {
      const userIdFromToken = parseInt(token.split('-')[2], 10);
      const userIdFromParam = parseInt(paramId, 10);

      if (isNaN(userIdFromToken) || isNaN(userIdFromParam) || userIdFromToken !== userIdFromParam) {
        return json({ canUse: false, reason: 'Token mismatch' }, 403);
      }

      if (!env.DB) {
        return json({ canUse: false, reason: 'Database not available' }, 500);
      }

      const customer = await env.DB.prepare(
        'SELECT extension_activated FROM customers WHERE id = ?'
      ).bind(userIdFromParam).first<{ extension_activated: number }>();

      if (customer && customer.extension_activated) {
        return json({
          canUse: true,
          reason: 'Premium access',
          trialUsed: 0,
          isBlocked: false
        });
      } else {
        // Return trial status for non-premium users
        return json({
          canUse: true,
          reason: 'Trial access',
          trialUsed: 5, // This could be dynamic in a real app
          isBlocked: false
        });
      }
    }
    
    return json({ canUse: false, reason: 'Invalid token' }, 401);
    
  } catch (error: any) {
    return json({ 
      error: error.message 
    }, 500);
  }
};
