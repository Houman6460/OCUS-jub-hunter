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
    const userId = params.id as string;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({
        canUse: false,
        reason: 'Not authenticated',
        trialUsed: 0,
        isBlocked: false
      });
    }

    const token = authHeader.substring(7);
    
    // Handle demo-jwt-token or jwt-token-1-* format
    if (token === 'demo-jwt-token' || (token.startsWith('jwt-token-') && token.includes('-1-'))) {
      return json({
        canUse: true,
        reason: 'Premium access',
        trialUsed: 0,
        isBlocked: false
      });
    }
    
    // For other users, return trial status
    return json({
      canUse: true,
      reason: 'Trial access',
      trialUsed: 5,
      isBlocked: false
    });
    
  } catch (error: any) {
    return json({ 
      error: error.message 
    }, 500);
  }
};
