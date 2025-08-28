// Cloudflare Pages Function: /api/stripe-webhook
// Handles Stripe webhook events to confirm purchases and activate premium features.

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';
import Stripe from 'stripe';

// Helper to create a JSON response
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Adjust for production
    },
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('No stripe-signature header', { status: 400 });
  }

  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const body = await request.text();
    console.log('Stripe webhook signature verified.');
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
    console.log('Stripe event constructed:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Handling checkout.session.completed for session ID:', session.id);
        console.log('Session details:', JSON.stringify(session, null, 2));
        const customerEmail = session.customer_details?.email;
        const customerName = session.customer_details?.name;
        const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : '';
        const amount = session.amount_total ? session.amount_total / 100 : 0;
        const currency = session.currency || 'usd';

        if (!customerEmail) {
          console.error('Webhook received checkout.session.completed without customer email');
          return new Response('Customer email is missing', { status: 400 });
        }

        // Reuse logic from complete-stripe-payment.ts
        console.log(`Processing purchase for customer: ${customerEmail}`);

        const now = new Date().toISOString();
        const dbSession = env.DB.withSession('webhook-session');
        console.log('Database session created.');

        const existingUser = await dbSession.prepare(`SELECT id, is_premium FROM users WHERE email = ?`).bind(customerEmail).first<{ id: number; is_premium: number }>();
        if (!existingUser) {
            console.error(`Webhook Error: User with email ${customerEmail} not found in the database.`);
        } else {
            console.log(`Found user ${customerEmail} with is_premium=${existingUser.is_premium}. Preparing to update.`);
        }

        const userUpdateStmt = dbSession.prepare(`
          UPDATE users SET is_premium = 1, extension_activated = 1, premium_activated_at = ? WHERE email = ?
        `).bind(now, customerEmail);

        const existingCustomer = await dbSession.prepare(`SELECT id FROM customers WHERE email = ?`).bind(customerEmail).first<{ id: number }>();
        console.log(`Checking for existing customer record for ${customerEmail}. Found: ${existingCustomer ? existingCustomer.id : 'none'}`);

        let customerStmt;
        if (existingCustomer?.id) {
          console.log(`Updating existing customer record for ID: ${existingCustomer.id}`);
          customerStmt = dbSession.prepare(`UPDATE customers SET is_premium = 1, extension_activated = 1 WHERE id = ?`).bind(existingCustomer.id);
        } else {
          console.log(`Creating new customer record for ${customerEmail}`);
          customerStmt = dbSession.prepare(`INSERT INTO customers (email, name, is_premium, extension_activated, created_at) VALUES (?, ?, 1, 1, ?)`).bind(customerEmail, customerName || customerEmail, now);
        }

        console.log('Executing database batch update for user and customer.');
        const batchResult = await dbSession.batch([userUpdateStmt, customerStmt]);
        console.log('Database batch update executed. Result:', JSON.stringify(batchResult, null, 2));

        const finalCustomer = await dbSession.prepare(`SELECT id FROM customers WHERE email = ?`).bind(customerEmail).first<{ id: number }>();
        if (!finalCustomer) {
          console.error('CRITICAL: Failed to find or create customer record in webhook.');
          throw new Error('Failed to find or create customer record in webhook.');
        }
        const finalCustomerId = finalCustomer.id;
        console.log(`Final customer ID for order creation: ${finalCustomerId}`);

        const downloadToken = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('Preparing to create order record.');
        const orderResult = await dbSession.prepare(`
          INSERT INTO orders (customerId, customerEmail, customerName, productId, productName, originalAmount, finalAmount, currency, status, paymentMethod, paymentIntentId, downloadToken, createdAt, completedAt)
          VALUES (?, ?, ?, 1, 'OCUS Job Hunter Extension', ?, ?, ?, 'completed', 'stripe', ?, ?, ?, ?)
        `).bind(finalCustomerId, customerEmail, customerName || customerEmail, amount, amount, currency.toLowerCase(), paymentIntentId, downloadToken, now, now).run();

        const orderId = orderResult.meta?.last_row_id;
        if (!orderId) {
          console.error('CRITICAL: Failed to create order in webhook.');
          throw new Error('Failed to create order in webhook.');
        }
        console.log(`Order created successfully with ID: ${orderId}`);

        const invoiceNumber = `INV-${orderId}-${Date.now()}`;
        console.log(`Preparing to create invoice record with number: ${invoiceNumber}`);
        await dbSession.prepare(`
          INSERT INTO invoices (orderId, invoiceNumber, customerId, customerEmail, amount, invoiceDate, dueDate, subtotal, taxAmount, discountAmount, totalAmount, currency, status, paidAt, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0.00, 0.00, ?, ?, 'paid', ?, ?, ?)
        `).bind(orderId, invoiceNumber, finalCustomerId, customerEmail, amount, now, now, amount, amount, currency, now, now, now).run();
        console.log(`Invoice created successfully for order ID: ${orderId}`);

        console.log('Database operations completed successfully for:', customerEmail);
        console.log('Successfully processed checkout.session.completed for:', customerEmail);
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return json({ received: true });
  } catch (err: any) {
    console.error('Error in Stripe webhook:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    },
  });
};
