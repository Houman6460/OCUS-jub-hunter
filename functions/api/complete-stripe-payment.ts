// Cloudflare Pages Function: /api/complete-stripe-payment
// Redirects to the correct purchase-complete endpoint

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';

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
      'Access-Control-Allow-Origin': '*',
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

    // Call the purchase-complete endpoint with the correct data structure
    const purchaseCompleteRequest = {
      paymentIntentId,
      customerEmail,
      customerName,
      amount: 29.99, // Default amount - should be passed from frontend
      currency: 'USD',
      productType: 'premium_extension'
    };

    // Call purchase-complete logic directly using the same logic
    if (!env.DB) {
      console.error('D1 database not available');
      return json({ success: false, message: 'Database not available' }, 500);
    }

    const now = new Date().toISOString();

    try {
      // Use D1 Sessions API to ensure consistency after writes
      const session = env.DB.withSession('first-primary');
      
      // Use a batch transaction to ensure all or nothing behavior
      const existingCustomer = await session.prepare(`SELECT id FROM customers WHERE email = ?`).bind(customerEmail).first<{ id: number }>();
      const customerId = existingCustomer?.id;

      const statements = [];

      // 1. Update users table
      statements.push(session.prepare(`
        UPDATE users 
        SET is_premium = 1, extension_activated = 1, premium_activated_at = ?
        WHERE email = ?
      `).bind(now, customerEmail));

      if (customerId) {
        // 2. Update existing customer
        statements.push(session.prepare(`
          UPDATE customers SET is_premium = 1, extension_activated = 1 WHERE id = ?
        `).bind(customerId));
      } else {
        // 2. Or create new customer
        statements.push(session.prepare(`
          INSERT INTO customers (email, name, is_premium, extension_activated, created_at) 
          VALUES (?, ?, 1, 1, ?)
        `).bind(customerEmail, customerName || customerEmail, now));
      }

      // The rest of the operations depend on the customerId, which we don't know before the batch runs.
      // This is a limitation of D1 batch. We have to run the first part, get the ID, then run the second part.
      // This is still better than no transaction at all.

      console.log('Running initial batch for user and customer update...');
      await session.batch(statements);
      console.log('User and customer tables updated successfully.');

      // Get the customer ID (either existing or newly created) - use same session for consistency
      const finalCustomer = await session.prepare(`SELECT id FROM customers WHERE email = ?`).bind(customerEmail).first<{ id: number }>();
      if (!finalCustomer) {
        throw new Error('Failed to find or create customer record.');
      }
      const finalCustomerId = finalCustomer.id;
      console.log('Final customer ID for orders/invoices:', finalCustomerId);

      // Now, create the order and invoice in a second batch
      const downloadToken = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // We need the orderId for the invoice, which is not available pre-batch.
      // We will have to do these sequentially but can wrap them in a manual transaction if D1 supported it.
      // For now, we accept the small risk between these inserts.

      const orderResult = await session.prepare(`
        INSERT INTO orders (customerId, customerEmail, customerName, productId, productName, originalAmount, finalAmount, currency, status, paymentMethod, paymentIntentId, downloadToken, createdAt, completedAt)
        VALUES (?, ?, ?, 1, 'OCUS Job Hunter Extension', ?, ?, ?, 'completed', 'stripe', ?, ?, ?, ?)
      `).bind(finalCustomerId, customerEmail, customerName || customerEmail, purchaseCompleteRequest.amount, purchaseCompleteRequest.amount, purchaseCompleteRequest.currency.toLowerCase(), paymentIntentId, downloadToken, now, now).run();

      const orderId = orderResult.meta?.last_row_id;
      if (!orderId) {
        throw new Error('Failed to create order, cannot retrieve order ID.');
      }

      const invoiceNumber = `INV-${orderId}-${Date.now()}`;

      const finalBatch = [];
      // 3. Create invoice
      finalBatch.push(session.prepare(`
        INSERT INTO invoices (orderId, invoiceNumber, customerId, customerEmail, 
                             amount, invoiceDate, dueDate, subtotal, taxAmount, discountAmount, 
                             totalAmount, currency, status, paidAt, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0.00, 0.00, ?, ?, 'paid', ?, ?, ?)
      `).bind(orderId, invoiceNumber, finalCustomerId, customerEmail, 
               purchaseCompleteRequest.amount, now, now, purchaseCompleteRequest.amount, purchaseCompleteRequest.amount, 
               purchaseCompleteRequest.currency, now, now, now));
      
      console.log('Running final batch for invoice...');
      await session.batch(finalBatch);
      console.log('Invoice created successfully for order ID:', orderId);

      console.log('Purchase completed successfully:', {
        customerId: finalCustomerId,
        orderId,
        paymentIntentId
      });
    
      return json({
        success: true,
        message: 'Payment completed successfully - Premium access activated'
      });

    } catch (error: any) {
      console.error('Error in complete-stripe-payment:', error);
      return json({ 
        success: false, 
        message: error.message 
      }, 500);
    }
  } catch (error: any) {
    console.error('Error in complete-stripe-payment:', error);
    return json({ 
      success: false, 
      message: error.message 
    }, 500);
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
