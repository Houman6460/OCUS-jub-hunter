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
    if (token === 'demo-jwt-token' || (token.startsWith('jwt-token-') && token.split('-')[2] === '1')) {
      return json({
        hasPurchased: true,
        totalSpent: '29.99',
        completedOrders: 1,
        lastPurchaseDate: Date.now()
      });
    }
    
    // Check database for real customer purchases
    if (!env.DB) {
      return json({
        hasPurchased: false,
        totalSpent: '0.00',
        completedOrders: 0,
        lastPurchaseDate: null
      });
    }

    try {
      // Parse email from token
      if (!token.startsWith('jwt-token-')) {
        return json({
          hasPurchased: false,
          totalSpent: '0.00',
          completedOrders: 0,
          lastPurchaseDate: null
        }, 401);
      }

      const parts = token.split('-');
      if (parts.length < 3) {
        return json({
          hasPurchased: false,
          totalSpent: '0.00',
          completedOrders: 0,
          lastPurchaseDate: null
        }, 401);
      }

      const email = parts[2];

      // First check users table (registered users)
      const user = await env.DB.prepare(`
        SELECT id, email, extension_activated, is_premium
        FROM users WHERE email = ?
      `).bind(email).first<{ id: number; email: string; extension_activated: number; is_premium: number }>();

      // If not found in users, check customers table
      const customer = user ? null : await env.DB.prepare(`
        SELECT id, email, extension_activated
        FROM customers WHERE email = ?
      `).bind(email).first<{ id: number; email: string; extension_activated: number }>();

      if (!user && !customer) {
        return json({
          hasPurchased: false,
          totalSpent: '0.00',
          completedOrders: 0,
          lastPurchaseDate: null
        });
      }

      const hasPremiumStatus = (user?.is_premium === 1) || Boolean(customer?.extension_activated);
      const hasExtensionActivated = (user?.extension_activated === 1) || Boolean(customer?.extension_activated);

      // Check completed orders using customer_email
      const orderStats = await env.DB.prepare(`
        SELECT COUNT(*) as completedOrders, 
               SUM(final_amount) as totalPaid,
               MAX(completed_at) as lastPurchaseDate
        FROM orders 
        WHERE customer_email = ? AND status = 'completed' AND final_amount > 0
      `).bind(email).first<{ completedOrders: number; totalPaid: string; lastPurchaseDate: string | number | null }>();

      const completedOrders = Number(orderStats?.completedOrders || 0);
      const totalPaid = String(orderStats?.totalPaid || '0.00');
      const lastPurchaseDate = orderStats?.lastPurchaseDate;

      const hasPurchased = (completedOrders > 0 && parseFloat(totalPaid || '0') > 0) || (hasPremiumStatus || hasExtensionActivated);

      return json({
        hasPurchased,
        totalSpent: totalPaid,
        completedOrders,
        lastPurchaseDate: lastPurchaseDate ? new Date(String(lastPurchaseDate)).getTime() : null
      });

    } catch (dbError) {
      console.error('Database error in purchase-status:', dbError);
      return json({
        hasPurchased: false,
        totalSpent: '0.00',
        completedOrders: 0,
        lastPurchaseDate: null
      });
    }
    
  } catch (error: any) {
    return json({ 
      error: error.message 
    }, 500);
  }
};
