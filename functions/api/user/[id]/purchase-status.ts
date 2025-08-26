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
      // First check users table (for registered customers)
      const user = await env.DB.prepare(`
        SELECT id, extension_activated, is_premium
        FROM users WHERE id = ?
      `).bind(parseInt(userId)).first();

      let customer = null;
      let hasPremiumStatus = false;
      let hasExtensionActivated = false;

      if (user) {
        hasPremiumStatus = user.is_premium === 1;
        hasExtensionActivated = user.extension_activated === 1;
        console.log('User found:', userId, 'Premium:', hasPremiumStatus, 'Extension:', hasExtensionActivated);
      } else {
        // Fallback to customers table
        customer = await env.DB.prepare(`
          SELECT id, extension_activated, is_premium
          FROM customers WHERE id = ?
        `).bind(parseInt(userId)).first();

        if (customer) {
          hasPremiumStatus = customer.is_premium === 1;
          hasExtensionActivated = customer.extension_activated === 1;
          console.log('Customer found:', userId, 'Premium:', hasPremiumStatus, 'Extension:', hasExtensionActivated);
        }
      }

      if (!user && !customer) {
        return json({
          hasPurchased: false,
          totalSpent: '0.00',
          completedOrders: 0,
          lastPurchaseDate: null
        });
      }

      // Check completed orders with correct column names
      const orderStats = await env.DB.prepare(`
        SELECT COUNT(*) as completedOrders, 
               SUM(final_amount) as totalPaid,
               MAX(completed_at) as lastPurchaseDate
        FROM orders 
        WHERE customer_id = ? AND status = 'completed' AND final_amount > 0
      `).bind(parseInt(userId)).first();

      const completedOrders = Number(orderStats?.completedOrders || 0);
      const totalPaid = String(orderStats?.totalPaid || '0.00');
      const lastPurchaseDate = orderStats?.lastPurchaseDate;

      const hasPurchased = hasPremiumStatus && hasExtensionActivated;

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
