// Cloudflare Pages Function: /api/me
// Handles user profile retrieval

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';

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
    // Check authorization header for token
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ 
        error: 'Unauthorized' 
      }, 401);
    }

    const token = authHeader.substring(7);
    
    // Handle demo-jwt-token
    if (token === 'demo-jwt-token') {
      return json({
        id: 1,
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'customer',
        createdAt: new Date().toISOString(),
        isPremium: true,
        extensionActivated: true,
        totalSpent: 29.99,
        totalOrders: 1,
        isAuthenticated: true
      });
    }
    
    // Handle jwt-token-{userId}-{timestamp} format
    if (token.startsWith('jwt-token-')) {
      const parts = token.split('-');
      if (parts.length >= 3) {
        const userId = parts[2];
        console.log('Parsed userId from token:', userId, 'from token:', token);
        
        // Check database for real user data
        if (!env.DB) {
          return json({ error: 'Database not available' }, 500);
        }

        try {
          const customer = await env.DB.prepare(`
            SELECT id, email, name, isPremium, extension_activated, createdAt
            FROM customers WHERE id = ?
          `).bind(parseInt(userId)).first();

          if (customer) {
            return json({
              id: customer.id,
              email: customer.email,
              name: customer.name,
              role: 'customer',
              createdAt: customer.createdAt,
              isPremium: customer.isPremium,
              extensionActivated: customer.extension_activated,
              isAuthenticated: true
            });
          }
        } catch (dbError) {
          console.error('Database error in /api/me:', dbError);
        }
      }
    }
    
    // For any other token, return unauthorized
    return json({ 
      error: 'Invalid token' 
    }, 401);
    
  } catch (error: any) {
    return json({ 
      error: error.message 
    }, 500);
  }
};
