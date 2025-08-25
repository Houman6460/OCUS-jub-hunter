// Cloudflare Pages Function: /api/purchase-complete
// Handles post-purchase processing: activate customer, generate invoice, update download access

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';

interface PurchaseCompleteRequest {
  paymentIntentId: string;
  customerEmail: string;
  customerName?: string;
  customerId?: number;
  amount: number;
  currency?: string;
  productType?: string;
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
    const body = await request.json() as PurchaseCompleteRequest;
    const { 
      paymentIntentId, 
      customerEmail, 
      customerName, 
      customerId, 
      amount, 
      currency = 'USD',
      productType = 'premium_extension'
    } = body;

    if (!paymentIntentId || !customerEmail || !amount) {
      return json({ success: false, message: 'Missing required fields' }, 400);
    }

    // Check if D1 database is available
    if (!env.DB) {
      console.error('D1 database not available');
      return json({ success: false, message: 'Database not available' }, 500);
    }

    const now = new Date().toISOString();

    try {
      // 1. Update or create customer record with premium access
      let finalCustomerId = customerId;
      
      if (customerId) {
        // Update existing customer
        await env.DB.prepare(`
          UPDATE customers 
          SET is_activated = true,
              extension_activated = true,
              subscription_status = 'active',
              total_spent = total_spent + ?,
              total_orders = total_orders + 1,
              last_order_date = ?,
              updated_at = ?
          WHERE id = ?
        `).bind(amount, now, now, customerId).run();
      } else {
        // Find customer by email or create new one
        const existingCustomer = await env.DB.prepare(`
          SELECT id FROM customers WHERE email = ?
        `).bind(customerEmail).first();

        if (existingCustomer) {
          finalCustomerId = (existingCustomer as any).id;
          await env.DB.prepare(`
            UPDATE customers 
            SET is_activated = true,
                extension_activated = true,
                subscription_status = 'active',
                total_spent = total_spent + ?,
                total_orders = total_orders + 1,
                last_order_date = ?,
                updated_at = ?
            WHERE id = ?
          `).bind(amount, now, now, finalCustomerId).run();
        } else {
          // Create new customer
          const result = await env.DB.prepare(`
            INSERT INTO customers (
              email, name, is_activated, extension_activated, 
              subscription_status, total_spent, total_orders, 
              last_order_date, created_at, updated_at
            ) VALUES (?, ?, true, true, 'active', ?, 1, ?, ?, ?)
          `).bind(
            customerEmail, 
            customerName || customerEmail, 
            amount, 
            now, 
            now, 
            now
          ).run();
          
          finalCustomerId = result.meta?.last_row_id as number;
        }
      }

      // 2. Create order record
      const orderResult = await env.DB.prepare(`
        INSERT INTO orders (
          user_id, customer_email, customer_name, 
          final_amount, currency, status, payment_method,
          payment_intent_id, download_token, created_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, 'completed', 'stripe', ?, ?, ?, ?)
      `).bind(
        finalCustomerId,
        customerEmail,
        customerName || customerEmail,
        amount,
        currency.toLowerCase(),
        paymentIntentId,
        `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        now,
        now
      ).run();

      const orderId = orderResult.meta?.last_row_id as number;

      // 3. Generate activation code for the extension
      const activationCode = `OCUS_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      await env.DB.prepare(`
        INSERT INTO activation_codes (
          code, customer_id, order_id, user_id, is_active, created_at
        ) VALUES (?, ?, ?, ?, true, ?)
      `).bind(activationCode, finalCustomerId, orderId, finalCustomerId, now).run();

      // 4. Create invoice record
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(orderId).padStart(6, '0')}`;
      
      await env.DB.prepare(`
        INSERT INTO invoices (
          invoice_number, customer_id, order_id, customer_email, customer_name,
          amount, currency, status, invoice_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'paid', ?, ?)
      `).bind(
        invoiceNumber,
        finalCustomerId,
        orderId,
        customerEmail,
        customerName || customerEmail,
        amount,
        currency,
        now,
        now
      ).run();

      // 5. Log the purchase completion
      console.log('Purchase completed successfully:', {
        customerId: finalCustomerId,
        orderId,
        paymentIntentId,
        amount,
        activationCode
      });

      return json({
        success: true,
        message: 'Purchase completed successfully',
        data: {
          customerId: finalCustomerId,
          orderId,
          activationCode,
          invoiceNumber,
          downloadEnabled: true
        }
      });

    } catch (dbError: any) {
      console.error('Database error during purchase completion:', dbError);
      return json({
        success: false,
        message: 'Failed to process purchase completion',
        error: dbError.message
      }, 500);
    }

  } catch (error: any) {
    console.error('Purchase completion error:', error);
    return json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
