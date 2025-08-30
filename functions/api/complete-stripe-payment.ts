// Cloudflare Pages Function: /api/complete-stripe-payment
// Handles Stripe payment completion using the storage layer

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';
import { DatabaseStorage } from '../../server/storage';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../shared/schema';

interface StripePaymentRequest {
  paymentIntentId: string;
  customerEmail: string;
  customerName: string;
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://jobhunter.one' : '*',
    },
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json() as StripePaymentRequest;
    const { paymentIntentId, customerEmail, customerName } = body;

    if (!paymentIntentId || !customerEmail) {
      return json({ success: false, message: 'Missing required fields' }, 400);
    }

    console.log('Stripe payment completion request:', { paymentIntentId, customerEmail, customerName });

    if (!env.DB) {
      console.error('D1 database not available');
      return json({ success: false, message: 'Database not available' }, 500);
    }

    // Initialize database connection and storage
    const db = drizzle(env.DB, { schema });
    const storage = new DatabaseStorage(db);

    const now = new Date().getTime();
    const amount = 29.99; // Default amount - should be passed from frontend
    const currency = 'USD';

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

      console.log(`✅ Payment completed successfully for ${customerEmail}:`);
      console.log(`   - Customer ID: ${customer.id}`);
      console.log(`   - Order ID: ${order.id}`);
      console.log(`   - Invoice: ${invoiceNumber}`);
      console.log(`   - Activation Code: ${activationCode}`);
      console.log(`   - Amount: ${amount} ${currency}`);
    
      return json({
        success: true,
        message: 'Payment completed successfully - Premium access activated',
        data: {
          orderId: order.id,
          invoiceNumber,
          activationCode,
          downloadToken
        }
      });

    } catch (error: any) {
      console.error('Error in complete-stripe-payment (primary path):', error);
      // Fallback: Use raw D1 queries with backward-compatible columns
      try {
        if (!env.DB) {
          return json({ success: false, message: 'Database not available' }, 500);
        }

        const session = env.DB.withSession('first-primary');
        const amountNum = amount; // 29.99

        // 1) Update existing customer by email; if none, insert minimal row
        const updateRes = await session
          .prepare(`
            UPDATE customers
            SET 
              extension_activated = 1,
              subscription_status = 'active',
              total_spent = CAST(COALESCE(total_spent, '0') AS REAL) + ?,
              total_orders = COALESCE(total_orders, 0) + 1,
              last_order_date = ?
            WHERE email = ?
          `)
          .bind(amountNum, now, customerEmail)
          .run();

        const changes = (updateRes as any)?.meta?.changes ?? 0;
        if (!changes) {
          await session
            .prepare(`
              INSERT INTO customers (
                email, name, extension_activated, subscription_status, total_spent, total_orders, last_order_date, created_at
              ) VALUES (?, ?, 1, 'active', ?, 1, ?, ?)
            `)
            .bind(
              customerEmail,
              customerName || customerEmail,
              amountNum,
              now,
              now,
            )
            .run();
        }

        // 2) Update user if exists (ignore if no row)
        await session
          .prepare(`
            UPDATE users
            SET 
              is_premium = 1,
              extension_activated = 1,
              premium_activated_at = ?,
              total_spent = CAST(COALESCE(total_spent, '0') AS REAL) + ?,
              total_orders = COALESCE(total_orders, 0) + 1
            WHERE email = ?
          `)
          .bind(now.toString(), amountNum, customerEmail)
          .run();

        // 3) Insert order
        const downloadToken = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const activationCode = `activation_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
        await session
          .prepare(`
            INSERT INTO orders (
              customer_email, customer_name,
              original_amount, final_amount, currency,
              status, payment_method, payment_intent_id,
              download_token, activation_code,
              created_at, completed_at
            ) VALUES (?, ?, ?, ?, ?, 'completed', 'stripe', ?, ?, ?, ?, ?)
          `)
          .bind(
            customerEmail,
            customerName || customerEmail,
            amountNum.toString(),
            amountNum.toString(),
            currency.toLowerCase(),
            paymentIntentId,
            downloadToken,
            activationCode,
            now,
            now,
          )
          .run();

        return json({
          success: true,
          message: 'Payment completed successfully (fallback) - Premium access activated',
          data: {
            activationCode,
            downloadToken,
          }
        });
      } catch (fallbackError: any) {
        console.error('Fallback path failed in complete-stripe-payment:', fallbackError);
        // Second-level fallback: write premium to settings so /api/me recognizes it immediately
        try {
          if (!env.DB) {
            return json({ success: false, message: 'Database not available' }, 500);
          }

          const session2 = env.DB.withSession('first-primary');
          const settingsKey = `user_${customerEmail.replace('@', '_at_').replace('.', '_dot_')}`;
          const valueObj = {
            id: customerEmail,
            email: customerEmail,
            name: customerName || customerEmail,
            isPremium: true,
            extensionActivated: true,
            updatedAt: now,
          };

          await session2
            .prepare(`
              INSERT INTO settings ("key", value) VALUES (?, ?)
              ON CONFLICT("key") DO UPDATE SET value = excluded.value
            `)
            .bind(settingsKey, JSON.stringify(valueObj))
            .run();

          return json({
            success: true,
            message: 'Payment completed (settings fallback) - Premium access activated',
            data: {
              via: 'settings',
            }
          });
        } catch (settingsError: any) {
          console.error('Settings fallback failed in complete-stripe-payment:', settingsError);
          return json({ 
            success: false, 
            message: `Payment completion failed: primary=${error?.message}; fallback=${fallbackError?.message}; settings=${settingsError?.message}` 
          }, 500);
        }
      }
    }
  } catch (error: any) {
    console.error('Error parsing request in complete-stripe-payment:', error);
    return json({ 
      success: false, 
      message: 'Invalid request format' 
    }, 400);
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://jobhunter.one' : '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};
