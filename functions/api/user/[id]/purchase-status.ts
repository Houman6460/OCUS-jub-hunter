// Cloudflare Pages Function: /api/user/[id]/purchase-status
// Handles user purchase status retrieval

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
        hasPurchased: false,
        totalSpent: '0.00',
        completedOrders: 0,
        lastPurchaseDate: null
      });
    }

    const token = authHeader.substring(7);
    
    // Handle demo-jwt-token or jwt-token-1-* format
    if (token === 'demo-jwt-token' || (token.startsWith('jwt-token-') && token.includes('-1-'))) {
      return json({
        hasPurchased: true,
        totalSpent: '29.99',
        completedOrders: 1,
        lastPurchaseDate: Date.now()
      });
    }
    
    // For other users, return no purchases
    return json({
      hasPurchased: false,
      totalSpent: '0.00',
      completedOrders: 0,
      lastPurchaseDate: null
    });
    
  } catch (error: any) {
    return json({ 
      error: error.message 
    }, 500);
  }
};
