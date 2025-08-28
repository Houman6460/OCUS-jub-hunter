// Cloudflare Pages Function: /api/me/orders
// Handles user order/purchase history retrieval for authenticated customers

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../lib/context';

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
      return json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.substring(7);
    
    // Handle demo-jwt-token
    if (token === 'demo-jwt-token') {
      return json([
        {
          id: 1,
          customerEmail: 'demo@example.com',
          customerName: 'Demo User',
          originalAmount: '29.99',
          finalAmount: '29.99',
          currency: 'eur',
          status: 'completed',
          paymentMethod: 'stripe',
          downloadToken: 'demo-download-token',
          downloadCount: 1,
          maxDownloads: 5,
          activationCode: 'DEMO-ACTIVATION-CODE',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        }
      ]);
    }
    
    // Handle jwt-token-{userId}-{timestamp} format
    if (token.startsWith('jwt-token-')) {
      const parts = token.split('-');
      if (parts.length >= 3) {
        const userId = parts[2];
        
        // Check database for real user orders
        if (!env.DB) {
          return json({ error: 'Database not available' }, 500);
        }

        try {
          // Use D1 Sessions API for consistent reads after writes
          const session = env.DB.withSession('first-primary');
          
          // Get customer info first
          const customer = await session.prepare(`
            SELECT id FROM customers WHERE email = ?
          `).bind(userId).first<{ id: number }>();

          if (!customer) {
            return json({ success: true, orders: [] });
          }

          // Get orders for this customer
          const orders = await session.prepare(`
            SELECT 
              id,
              customerEmail,
              customerName,
              productId,
              productName,
              originalAmount,
              finalAmount,
              currency,
              status,
              paymentMethod,
              paymentIntentId,
              downloadToken,
              downloadCount,
              maxDownloads,
              activationCode,
              invoiceNumber,
              createdAt,
              completedAt
            FROM orders 
            WHERE customerEmail = ?
            ORDER BY createdAt DESC
          `).bind(userId).all();

          return json(orders.results || []);

        } catch (dbError) {
          console.error('Database error in /api/me/orders:', dbError);
          return json({ error: 'Database error' }, 500);
        }
      }
    }
    
    // For any other token, return unauthorized
    return json({ error: 'Invalid token' }, 401);
    
  } catch (error: any) {
    return json({ 
      error: error.message 
    }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
