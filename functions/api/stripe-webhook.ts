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

// Helper to generate invoice PDF (placeholder for now)
async function generateInvoicePDF(invoiceData: any): Promise<string> {
  // TODO: Implement PDF generation using jsPDF or similar
  // For now, return a placeholder URL
  return `/api/invoices/${invoiceData.invoiceNumber}.pdf`;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    console.error('Webhook Error: Missing stripe-signature header');
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;
  
  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20', // Use stable API version
      httpClient: Stripe.createFetchHttpClient(),
    });

    const body = await request.text();
    
    // Verify webhook signature
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
    console.log('Stripe webhook signature verified for event:', event.type);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  // Initialize database connection and storage
  const db = drizzle(env.DB, { schema });
  const storage = new DatabaseStorage(db);

  try {

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, storage);
        break;
      case 'payment_intent.succeeded':
        console.log('Payment intent succeeded:', event.data.object.id);
        // Additional handling if needed
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment intent failed:', event.data.object.id);
        // Handle failed payments
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        console.log('Subscription event:', event.type, event.data.object.id);
        // Handle subscription events if needed
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return json({ received: true, processed: true });
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
      // Update customer to premium status
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
      userId: user?.id,
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

    // 7. Generate invoice PDF URL (placeholder)
    const invoiceUrl = await generateInvoicePDF({
      invoiceNumber,
      customerName: customerName || customerEmail,
      customerEmail,
      amount,
      currency,
      date: new Date(now).toISOString(),
    });

    // 8. Update order with invoice URL
    await storage.updateOrder(order.id, {
      invoiceUrl,
    });

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
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
      'Access-Control-Max-Age': '86400',
    },
  });
};
