// Cloudflare Pages Function: /api/stripe-webhook
// Handles Stripe webhook events to confirm purchases and activate premium features.

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';
import { DatabaseStorage } from '../../server/storage';
import Stripe from 'stripe';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../shared/schema';

// Helper to create a JSON response
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://stripe.com', // Only allow Stripe
    },
  });
}

// Fallback: fetch webhook signing secret from DB settings if not provided in env
async function getWebhookSecret(env: Env): Promise<string | null> {
  if (env.STRIPE_WEBHOOK_SECRET) return env.STRIPE_WEBHOOK_SECRET;
  try {
    const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('payment_stripeWebhookSecret')
      .first<{ value: string }>();
    if (row && row.value) return typeof row.value === 'string' ? row.value : String(row.value);
  } catch (e) {
    // ignore and return null
  }
  return null;
}

// Helper to get invoice PDF URL (served dynamically by Pages Function)
async function generateInvoicePDF(invoiceData: any): Promise<string> {
  const invoiceId = invoiceData?.id || invoiceData?.invoiceId;
  // Our download endpoint generates the PDF on demand by invoice ID
  if (invoiceId) return `/api/invoices/${invoiceId}/download`;
  // Fallback: if only invoiceNumber is present (shouldn't happen), still return route (may 404)
  const invoiceNumber = invoiceData?.invoiceNumber;
  return `/api/invoices/${encodeURIComponent(invoiceNumber || '')}/download`;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env, waitUntil } = ctx as any;
  const signature = request.headers.get('stripe-signature') || request.headers.get('Stripe-Signature');
  if (!signature) {
    console.error('Webhook Error: Missing Stripe-Signature header');
    return new Response('Missing Stripe-Signature header', { status: 400 });
  }

  if (!env.STRIPE_SECRET_KEY) {
    console.error('Missing STRIPE_SECRET_KEY');
    return new Response('Server not configured', { status: 500 });
  }

  const webhookSecret = await getWebhookSecret(env);
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return new Response('Webhook not configured', { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      // Use account default API version
      httpClient: Stripe.createFetchHttpClient(),
    });

    const body = await request.text();

    const cryptoProvider = Stripe.createSubtleCryptoProvider();

    // Verify webhook signature using Web Crypto provider (Workers-compatible)
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, cryptoProvider);
    console.log('Stripe webhook signature verified for event:', event.type);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err?.message || err);
    return new Response(`Webhook signature verification failed: ${err?.message || 'unknown error'}`, { status: 400 });
  }

  // Initialize database connection and storage
  const db = drizzle(env.DB, { schema }) as any; // Type assertion for D1 compatibility
  const storage = new DatabaseStorage(db);

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Scheduling checkout.session.completed processing via waitUntil');
        waitUntil((async () => {
          try {
            await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, storage);
          } catch (e) {
            console.error('Deferred processing error (checkout.session.completed):', e);
          }
        })());
        break;
      case 'payment_intent.succeeded':
        console.log('Payment intent succeeded:', (event.data.object as any).id);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment intent failed:', (event.data.object as any).id);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        console.log('Subscription event:', event.type, (event.data.object as any).id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Acknowledge immediately; processing continues asynchronously
    return json({ received: true, scheduled: true });
  } catch (err: any) {
    console.error('Error processing Stripe webhook:', err);
    return new Response(`Webhook processing error: ${err.message}`, { status: 500 });
  }
};

// Handle checkout session completed event
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  storage: DatabaseStorage
): Promise<void> {
  console.log('Processing checkout.session.completed for session:', session.id);

  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;
  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : '';
  const amount = session.amount_total ? session.amount_total / 100 : 0;
  const currency = session.currency || 'usd';

  if (!customerEmail) {
    throw new Error('Customer email is required for checkout completion');
  }

  // Idempotency guard: if we've already created an order for this payment intent, exit early
  if (paymentIntentId) {
    const existing = await storage.getOrderByPaymentIntentId(paymentIntentId);
    if (existing) {
      console.log(`Idempotency: order already exists for paymentIntentId=${paymentIntentId}. Order ID: ${existing.id}`);
      return;
    }
  }

  console.log(`Processing purchase for: ${customerEmail}, Amount: ${amount} ${currency.toUpperCase()}`);

  const now = new Date().getTime();

  try {
    // 1. Find or create customer
    let customer = await storage.getCustomerByEmail(customerEmail);
    if (!customer) {
      console.log(`Creating new customer: ${customerEmail}`);
      customer = await storage.createCustomer({
        email: customerEmail,
        name: customerName || customerEmail,
        extensionActivated: true,
        subscriptionStatus: 'active',
        totalSpent: amount.toString(),
        totalOrders: 1,
        lastOrderDate: now,
      });
    } else {
      console.log(`Updating existing customer: ${customerEmail}`);
      await storage.updateCustomer(customer.id, {
        extensionActivated: true,
        subscriptionStatus: 'active',
        totalSpent: (parseFloat(customer.totalSpent) + amount).toString(),
        totalOrders: customer.totalOrders + 1,
        lastOrderDate: now,
        updatedAt: now,
      });
    }

    // 2. Update user if exists (for authenticated users)
    const user = await storage.getUserByEmail(customerEmail);
    if (user) {
      console.log(`Updating user premium status: ${customerEmail}`);
      await storage.updateUser(user.id, {
        isPremium: true,
        extensionActivated: true,
        premiumActivatedAt: now.toString(),
        totalSpent: (parseFloat(user.totalSpent) + amount).toString(),
        totalOrders: user.totalOrders + 1,
      });
    }

    // 3. Create order record
    const downloadToken = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const activationCode = `activation_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;

    console.log('Creating order record...');
    const order = await storage.createOrder({
      userId: user?.id || null,
      customerEmail,
      customerName: customerName || customerEmail,
      originalAmount: amount.toString(),
      finalAmount: amount.toString(),
      currency: currency.toLowerCase(),
      status: 'completed',
      paymentMethod: 'stripe',
      paymentIntentId,
      downloadToken,
      activationCode,
      completedAt: now,
    });

    console.log(`Order created with ID: ${order.id}`);

    // 4. Create invoice
    const invoiceNumber = `INV-${order.id}-${Date.now()}`;
    console.log(`Creating invoice: ${invoiceNumber}`);

    const invoice = await storage.createInvoice({
      orderId: order.id,
      invoiceNumber,
      customerId: customer.id,
      customerName: customerName || customerEmail,
      customerEmail,
      invoiceDate: now,
      dueDate: now, // Immediate payment
      subtotal: amount.toString(),
      taxAmount: '0.00',
      discountAmount: '0.00',
      totalAmount: amount.toString(),
      currency: currency.toUpperCase(),
      status: 'paid',
      paidAt: now,
    });

    // 5. Create invoice item
    await storage.createInvoiceItem({
      invoiceId: invoice.id,
      productName: 'OCUS Job Hunter Extension',
      description: 'Premium Chrome Extension for OCUS Job Hunting',
      quantity: 1,
      unitPrice: amount.toString(),
      totalPrice: amount.toString(),
    });

    // 6. Generate activation key
    const activationKey = await storage.createActivationKey({
      activationKey: activationCode,
      orderId: order.id,
      userId: user?.id,
    });

    console.log(`Activation key created: ${activationKey.activationKey}`);

    // 7. Get invoice PDF URL (served by /api/invoices/:id/download)
    const invoiceUrl = await generateInvoicePDF({ id: invoice.id, invoiceNumber });

    // 8. Update order with invoice URL
    await storage.updateOrder(order.id, { invoiceUrl });

    console.log(`✅ Successfully processed purchase for ${customerEmail}:`);
    console.log(`   - Customer ID: ${customer.id}`);
    console.log(`   - Order ID: ${order.id}`);
    console.log(`   - Invoice: ${invoiceNumber}`);
    console.log(`   - Activation Code: ${activationCode}`);
    console.log(`   - Amount: ${amount} ${currency.toUpperCase()}`);
  } catch (error: any) {
    console.error('Error in handleCheckoutSessionCompleted:', error);
    throw new Error(`Failed to process checkout completion: ${error.message}`);
  }
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://stripe.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature, Stripe-Signature',
      'Access-Control-Max-Age': '86400',
    },
  });
};
