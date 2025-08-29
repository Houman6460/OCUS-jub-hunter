// Cloudflare Pages Function: /api/me/invoices
// Handles user invoice retrieval for authenticated customers

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
          invoice_number: 'INV-2025-000001',
          order_id: 1,
          customer_name: 'Demo User',
          customer_email: 'demo@example.com',
          invoice_date: new Date().toISOString(),
          due_date: new Date().toISOString(),
          subtotal: '29.99',
          tax_amount: '0.00',
          discount_amount: '0.00',
          total_amount: '29.99',
          currency: 'USD',
          status: 'paid',
          paid_at: new Date().toISOString(),
          notes: 'Premium extension purchase',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          payment_method: 'stripe'
        }
      ]);
    }
    
    // Handle jwt-token-{email}-{timestamp} format
    if (token.startsWith('jwt-token-')) {
      const parts = token.split('-');
      if (parts.length < 3) {
        return json({ error: 'Invalid token' }, 401);
      }
      const userEmail = parts[2];

      // Check database for real user invoices
      if (!env.DB) {
        return json({ error: 'Database not available' }, 500);
      }

      try {
        // Get invoices for this customer with order details
        const query = `
          SELECT 
            i.id AS id,
            i.invoice_number AS invoice_number,
            i.order_id AS order_id,
            i.customer_name AS customer_name,
            i.customer_email AS customer_email,
            i.invoice_date AS invoice_date,
            i.due_date AS due_date,
            i.subtotal AS subtotal,
            i.tax_amount AS tax_amount,
            i.discount_amount AS discount_amount,
            i.total_amount AS total_amount,
            i.currency AS currency,
            i.status AS status,
            i.paid_at AS paid_at,
            i.notes AS notes,
            i.created_at AS created_at,
            i.updated_at AS updated_at,
            o.payment_method AS payment_method
          FROM invoices i
          LEFT JOIN orders o ON i.order_id = o.id
          WHERE i.customer_email = ?
          ORDER BY i.created_at DESC
        `;

        const invoices = await env.DB.prepare(query).bind(userEmail).all();
        return json(invoices.results || []);

      } catch (dbError) {
        console.error('Database error in /api/me/invoices:', dbError);
        return json({ error: 'Database error' }, 500);
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
