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
      // Update users table (for registered users)
      const userUpdateResult = await env.DB.prepare(`
        UPDATE users 
        SET is_premium = 1,
            extension_activated = 1,
            premium_activated_at = ?
        WHERE email = ?
      `).bind(now, customerEmail).run();
      
      console.log('User table update result for', customerEmail, ':', userUpdateResult);
      
      // Ensure we have a customer ID for orders/invoices
      let finalCustomerId = null;
      const existingCustomer = await env.DB.prepare(`
        SELECT id FROM customers WHERE email = ?
      `).bind(customerEmail).first();

      if (existingCustomer) {
        finalCustomerId = (existingCustomer as any).id;
        await env.DB.prepare(`
          UPDATE customers 
          SET is_premium = 1,
              extension_activated = 1
          WHERE id = ?
        `).bind(finalCustomerId).run();
      } else {
        // Create new customer record
        const result = await env.DB.prepare(`
          INSERT INTO customers (
            email, name, is_premium, extension_activated, 
            created_at
          ) VALUES (?, ?, 1, 1, ?)
        `).bind(
          customerEmail, 
          customerName || customerEmail, 
          now
        ).run();
        
        finalCustomerId = result.meta?.last_row_id as number;
      }

      console.log('Final customer ID for orders/invoices:', finalCustomerId);

      // Create order record
      const downloadToken = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const orderResult = await env.DB.prepare(`
        INSERT INTO orders (
          customer_id, customer_email, customer_name, 
          original_amount, final_amount, currency, status, payment_method,
          payment_intent_id, download_token, created_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'completed', 'stripe', ?, ?, ?, ?)
      `).bind(
        finalCustomerId,
        customerEmail,
        customerName || customerEmail,
        purchaseCompleteRequest.amount,
        purchaseCompleteRequest.amount,
        purchaseCompleteRequest.currency.toLowerCase(),
        paymentIntentId,
        downloadToken,
        now,
        now
      ).run();

      const orderId = orderResult.meta?.last_row_id as number;

      // Generate activation code
      const activationCode = `OCUS_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      await env.DB.prepare(`
        INSERT INTO activation_codes (
          code, order_id, created_at
        ) VALUES (?, ?, ?)
      `).bind(activationCode, orderId, now).run();

      // Skip invoice creation for now due to schema conflicts
      // Invoice will be generated via separate endpoint if needed
      console.log('Skipping invoice creation due to schema conflicts');

      console.log('Purchase completed successfully:', {
        customerId: finalCustomerId,
        orderId,
        paymentIntentId,
        activationCode
      });
    
      // Return activation key for frontend compatibility
      return json({
        success: true,
        activationKey: activationCode,
        message: 'Payment completed successfully'
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
