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
        id: 1,
        email: 'fallback@example.com',
        name: 'Fallback User',
        role: 'customer',
        createdAt: new Date().toISOString(),
        isAuthenticated: false
      });
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
        // For user ID 1, return demo data
        if (userId === '1') {
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
      }
    }
    
    // For any other token, return fallback
    return json({
      id: 1,
      email: 'fallback@example.com',
      name: 'Fallback User',
      role: 'customer',
      createdAt: new Date().toISOString(),
      isAuthenticated: false
    });
    
  } catch (error: any) {
    return json({ 
      error: error.message 
    }, 500);
  }
};
