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
          invoice_number: 'INV-2024-001',
          order_id: 1,
          amount: '29.99',
          currency: 'eur',
          tax_amount: '0.00',
          status: 'paid',
          invoice_date: new Date().toISOString(),
          paid_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          customer_name: 'Demo User',
          customer_email: 'demo@example.com',
          payment_method: 'stripe',
          product_id: 'premium-extension'
        }
      ]);
    }
    
    // Handle jwt-token-{userId}-{timestamp} format
    if (token.startsWith('jwt-token-')) {
      const parts = token.split('-');
      if (parts.length >= 3) {
        const userId = parts[2];
        
        // Check database for real user invoices
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
            return json({ success: true, invoices: [] });
          }

          // Get invoices for this customer with order details
          const invoices = await session.prepare(`
            SELECT 
              i.id,
              i.orderId,
              i.invoiceNumber,
              i.customerId,
              i.customerEmail,
              i.invoiceDate,
              i.dueDate,
              i.subtotal,
              i.taxAmount,
              i.discountAmount,
              i.totalAmount,
              i.currency,
              i.status,
              i.paidAt,
              i.createdAt,
              i.updatedAt,
              o.productName,
              o.paymentMethod,
              o.downloadToken
            FROM invoices i
            JOIN orders o ON i.orderId = o.id
            WHERE i.customerEmail = ?
            ORDER BY i.createdAt DESC
          `).bind(userId).all();

          return json(invoices.results || []);

        } catch (dbError) {
          console.error('Database error in /api/me/invoices:', dbError);
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
