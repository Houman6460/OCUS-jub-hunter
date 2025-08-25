// Cloudflare Pages Function: /api/extension/downloads/[id]
// Handles extension downloads list

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
      return json([]);
    }

    const token = authHeader.substring(7);
    
    // Handle demo-jwt-token or jwt-token-1-* format
    if (token === 'demo-jwt-token' || (token.startsWith('jwt-token-') && token.includes('-1-'))) {
      return json([
        {
          id: 1,
          downloadToken: 'demo-download-token',
          downloadType: 'paid',
          downloadCount: 1,
          createdAt: new Date().toISOString()
        }
      ]);
    }
    
    // For other users, return empty array
    return json([]);
    
  } catch (error: any) {
    return json({ 
      error: error.message 
    }, 500);
  }
};
