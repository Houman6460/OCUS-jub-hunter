// Cloudflare Pages Function: /api/manual-invoice-fix
// A temporary endpoint to manually generate a missing invoice for a given user.

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';

const MANUAL_FIX_AUTH_KEY = 'super-secret-manual-fix-key';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

interface FixRequest {
  customerEmail: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const authKey = request.headers.get('X-Fix-Auth-Key');
    if (authKey !== MANUAL_FIX_AUTH_KEY) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json<FixRequest>();
    const { customerEmail } = body;

    if (!customerEmail) {
      return json({ error: 'customerEmail is required' }, 400);
    }

    if (!env.DB) {
      return json({ error: 'Database not available' }, 500);
    }

    // 1. Find user and customer details
    const user = await env.DB.prepare(`SELECT * FROM users WHERE email = ?`).bind(customerEmail).first<any>();
    if (!user) {
      return json({ error: 'User not found.' }, 404);
    }

    let customer = await env.DB.prepare(`SELECT * FROM customers WHERE email = ?`).bind(customerEmail).first<any>();
    let customerId;

    if (!customer) {
      console.log('No customer found. Creating a new customer record.');
      const customerResult = await env.DB.prepare(
        `INSERT INTO customers (user_id, email, name, stripe_customer_id, created_at)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        user.id,
        customerEmail,
        user.name || 'N/A',
        `cus_manual_${Date.now()}`,
        new Date().toISOString()
      ).run();

      customerId = customerResult.meta?.last_row_id;
      if (!customerId) {
        throw new Error('Failed to create manual customer record.');
      }
      console.log('Manual customer record created with ID:', customerId);
      customer = { id: customerId, email: customerEmail, name: user.name || 'N/A' }; // Use the newly created customer data
    } else {
      customerId = customer.id;
    }

    // 2. Find the latest order for the user
    let latestOrder = await env.DB.prepare(
      `SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC LIMIT 1`
    ).bind(customerEmail).first<any>();

    let orderId;

    if (!latestOrder) {
      // 3. If no order exists, create one
      console.log('No order found. Creating a new order for the user.');
      const now = new Date().toISOString();
      const orderResult = await env.DB.prepare(
        `INSERT INTO orders (customer_id, customer_email, customer_name, original_amount, final_amount, currency, status, payment_method, payment_intent_id, created_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, 'completed', 'stripe', ?, ?, ?)`
      ).bind(
        customerId,
        customerEmail,
        customer.name,
        29.99, // Default amount
        29.99, // Default amount
        'usd',
        `pi_manual_${Date.now()}`, // Placeholder payment intent
        now,
        now
      ).run();
      
      orderId = orderResult.meta?.last_row_id;
      if (!orderId) {
        throw new Error('Failed to create manual order.');
      }
      console.log('Manual order created with ID:', orderId);
    } else {
      orderId = latestOrder.id;
    }

    // 4. Check if an invoice already exists for this order
    const existingInvoice = await env.DB.prepare(
      `SELECT id FROM invoices WHERE order_id = ?`
    ).bind(orderId).first();

    if (existingInvoice) {
      return json({ message: 'Invoice already exists for the order.', orderId }, 200);
    }

    // 5. Generate the missing invoice
    const now = new Date().toISOString();
    const invoiceNumber = `INV-${orderId}-${Date.now()}`;
    const finalOrderDetails = latestOrder || { id: orderId, customer_id: customer.id, customer_email: customerEmail, customer_name: customer.name, final_amount: 29.99, currency: 'usd' };

    await env.DB.prepare(
      `INSERT INTO invoices (order_id, invoice_number, customer_id, customer_email, customer_name, amount, currency, status, invoice_date, due_date, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'paid', ?, ?, ?)`
    ).bind(
      orderId,
      invoiceNumber,
      finalOrderDetails.customer_id,
      finalOrderDetails.customer_email,
      finalOrderDetails.customer_name,
      finalOrderDetails.final_amount,
      finalOrderDetails.currency,
      now, // invoice_date
      now, // due_date
      now  // paid_at
    ).run();

    return json({ success: true, message: 'Successfully generated missing invoice.', orderId, invoiceNumber });

  } catch (error: any) {
    console.error('Error in /api/manual-invoice-fix:', error);
    return json({ error: error.message }, 500);
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Fix-Auth-Key',
    },
  });
};
