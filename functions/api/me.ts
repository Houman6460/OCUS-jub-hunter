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
    // Check authorization header first for demo token
    const authHeader = request.headers.get('Authorization');
    
    // PRIORITY: Always return demo customer data for demo-jwt-token
    if (authHeader?.includes('demo-jwt-token')) {
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
    
    // For any other case, return fallback
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
