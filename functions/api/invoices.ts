// Cloudflare Pages Function: /api/invoices
// Handles invoice retrieval

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
      return json([]);
    }

    const token = authHeader.substring(7);
    
    // Demo token still returns mock data
    if (token === 'demo-jwt-token') {
      const demoInvoice = {
        id: 1,
        invoiceNumber: 'INV-2025-000001',
        customerId: 1,
        customerName: 'Demo User',
        customerEmail: 'demo@example.com',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        subtotal: '29.99',
        totalAmount: '29.99',
        currency: 'USD',
        status: 'paid',
        paidAt: new Date().toISOString(),
        notes: 'Premium extension purchase'
      };
      return json([demoInvoice]);
    }

    // Real users: token format jwt-token-{email}-{timestamp}
    if (token.startsWith('jwt-token-')) {
      const parts = token.split('-');
      if (parts.length < 3) {
        return json([]);
      }
      const userEmail = parts[2];

      if (!env.DB) {
        return json({ error: 'Database not available' }, 500);
      }

      try {
        const query = `
          SELECT 
            i.id,
            i.invoice_number,
            i.order_id,
            i.customer_name,
            i.customer_email,
            i.invoice_date,
            i.due_date,
            i.subtotal,
            i.tax_amount,
            i.discount_amount,
            i.total_amount,
            i.currency,
            i.status,
            i.paid_at,
            i.notes,
            i.created_at,
            i.updated_at,
            o.payment_method
          FROM invoices i
          LEFT JOIN orders o ON o.id = i.order_id
          WHERE i.customer_email = ?
          ORDER BY i.created_at DESC
        `;

        const result = await env.DB.prepare(query).bind(userEmail).all();
        const rows = result.results || [];
        const invoices = rows.map((r: any) => ({
          id: r.id,
          invoiceNumber: r.invoice_number,
          orderId: r.order_id,
          customerName: r.customer_name,
          customerEmail: r.customer_email,
          invoiceDate: r.invoice_date,
          dueDate: r.due_date,
          subtotal: r.subtotal,
          taxAmount: r.tax_amount,
          discountAmount: r.discount_amount,
          totalAmount: r.total_amount,
          currency: r.currency,
          status: r.status,
          paidAt: r.paid_at,
          notes: r.notes,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          paymentMethod: r.payment_method,
        }));

        return json(invoices);
      } catch (dbError: any) {
        console.error('DB error in /api/invoices:', dbError);
        return json([]);
      }
    }

    // For any other case, return empty array
    return json([]);
    
  } catch (error: any) {
    return json({ 
      error: error.message 
    }, 500);
  }
};
