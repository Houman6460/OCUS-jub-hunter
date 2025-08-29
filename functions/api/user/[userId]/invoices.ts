import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../../lib/context';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // Authorization header
    const authHeader = context.request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    const token = authHeader.substring(7);

    // Demo token -> return mock camelCase invoice
    if (token === 'demo-jwt-token') {
      const demoInvoice = {
        id: 1,
        invoiceNumber: 'INV-2025-000001',
        orderId: 1,
        customerName: 'Demo User',
        customerEmail: 'demo@example.com',
        invoiceDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        subtotal: '29.99',
        taxAmount: '0.00',
        discountAmount: '0.00',
        totalAmount: '29.99',
        currency: 'USD',
        status: 'paid',
        paidAt: new Date().toISOString(),
        notes: 'Premium extension purchase',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentMethod: 'stripe'
      };
      return new Response(JSON.stringify([demoInvoice]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // Real tokens: jwt-token-{email}-{timestamp}
    if (!token.startsWith('jwt-token-')) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    const parts = token.split('-');
    if (parts.length < 3) {
      return new Response(JSON.stringify({ error: 'Invalid token format' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    const userEmail = parts[2];

    if (!context.env.DB) {
      return new Response(JSON.stringify({ error: 'Database not available' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    const query = `
      SELECT 
        i.id AS id,
        i.invoice_number AS invoiceNumber,
        i.order_id AS orderId,
        i.customer_name AS customerName,
        i.customer_email AS customerEmail,
        i.invoice_date AS invoiceDate,
        i.due_date AS dueDate,
        i.subtotal AS subtotal,
        i.tax_amount AS taxAmount,
        i.discount_amount AS discountAmount,
        i.total_amount AS totalAmount,
        i.currency AS currency,
        i.status AS status,
        i.paid_at AS paidAt,
        i.notes AS notes,
        i.created_at AS createdAt,
        i.updated_at AS updatedAt,
        o.payment_method AS paymentMethod
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      WHERE i.customer_email = ?
      ORDER BY i.created_at DESC
    `;

    try {
      const result = await context.env.DB.prepare(query).bind(userEmail).all();
      const invoices = result.results || [];
      return new Response(JSON.stringify(invoices), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    } catch (dbErr) {
      console.error('DB error in /api/user/[userId]/invoices:', dbErr);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
  } catch (error) {
    console.error('Error fetching user invoices:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch invoices' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
};
