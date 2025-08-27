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
    const nowDate = new Date();

    try {
      // 1. Update or create customer record with premium access
      let finalCustomerId = customerId;
      
      // First update users table (for registered users)
      if (customerEmail) {
        const userUpdateResult = await env.DB.prepare(`
          UPDATE users 
          SET is_premium = 1,
              extension_activated = 1,
              premium_activated_at = ?,
              total_spent = COALESCE(total_spent, 0) + ?,
              total_orders = COALESCE(total_orders, 0) + 1
          WHERE email = ?
        `).bind(now, amount, customerEmail).run();
        
        console.log('User table update result for', customerEmail, ':', userUpdateResult);
        
        // If no user was updated, we need to ensure we have a customer ID for orders/invoices
        if (userUpdateResult.meta?.changes === 0) {
          console.log('No user found with email', customerEmail, 'in users table');
        }
      }
      
      if (customerId) {
        // Update existing customer
        await env.DB.prepare(`
          UPDATE customers 
          SET is_premium = 1,
              extension_activated = 1,
              total_spent = COALESCE(total_spent, 0) + ?,
              total_orders = COALESCE(total_orders, 0) + 1,
              updated_at = ?
          WHERE id = ?
        `).bind(amount, now, customerId).run();
      } else {
        // Find customer by email or create new one
        const existingCustomer = await env.DB.prepare(`
          SELECT id FROM customers WHERE email = ?
        `).bind(customerEmail).first();

        if (existingCustomer) {
          finalCustomerId = (existingCustomer as any).id;
          await env.DB.prepare(`
            UPDATE customers 
            SET is_premium = 1,
                extension_activated = 1,
                updated_at = ?
            WHERE id = ?
          `).bind(now, finalCustomerId).run();
        } else {
          // Create new customer
          const result = await env.DB.prepare(`
            INSERT INTO customers (
              email, name, is_premium, extension_activated, 
              created_at, updated_at
            ) VALUES (?, ?, 1, 1, ?, ?)
          `).bind(
            customerEmail, 
            customerName || customerEmail, 
            now, 
            now
          ).run();
          
          finalCustomerId = result.meta?.last_row_id as number;
        }
      }

      // 2. Ensure we have a customer ID for orders/invoices
      if (!finalCustomerId) {
        // Find or create customer record for users who don't have a customer ID
        const existingCustomer = await env.DB.prepare(`
          SELECT id FROM customers WHERE email = ?
        `).bind(customerEmail).first();

        if (existingCustomer) {
          finalCustomerId = (existingCustomer as any).id;
          await env.DB.prepare(`
            UPDATE customers 
            SET is_premium = 1,
                extension_activated = 1,
                total_spent = COALESCE(total_spent, 0) + ?,
                total_orders = COALESCE(total_orders, 0) + 1,
                updated_at = ?
            WHERE id = ?
          `).bind(amount, now, finalCustomerId).run();
        } else {
          // Create new customer record
          const result = await env.DB.prepare(`
            INSERT INTO customers (
              email, name, is_premium, extension_activated, 
              total_spent, total_orders, created_at, updated_at
            ) VALUES (?, ?, 1, 1, ?, 1, ?, ?)
          `).bind(
            customerEmail, 
            customerName || customerEmail, 
            amount,
            now, 
            now
          ).run();
          
          finalCustomerId = result.meta?.last_row_id as number;
        }
      }

      console.log('Final customer ID for orders/invoices:', finalCustomerId);

      // 3. Create order record
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
        amount,
        amount,
        currency.toLowerCase(),
        paymentIntentId,
        downloadToken,
        now,
        now
      ).run();

      const orderId = orderResult.meta?.last_row_id as number;

      // 4. Generate activation code for the extension
      const activationCode = `OCUS_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      await env.DB.prepare(`
        INSERT INTO activation_codes (
          code, order_id, created_at
        ) VALUES (?, ?, ?)
      `).bind(activationCode, orderId, now).run();

      // 5. Create invoice record
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const invoiceDate = nowDate;
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      
      const invoiceResult = await env.DB.prepare(`
        INSERT INTO invoices (
          invoice_number, order_id, customer_id, customer_name, customer_email,
          invoice_date, due_date, subtotal, tax_amount, discount_amount, 
          total_amount, currency, status, paid_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0.00, 0.00, ?, ?, 'paid', ?, ?, ?)
      `).bind(
        invoiceNumber,
        orderId,
        finalCustomerId,
        customerName || customerEmail,
        customerEmail,
        invoiceDate.toISOString(),
        dueDate.toISOString(),
        amount,
        amount,
        'USD',
        invoiceDate.toISOString(),
        invoiceDate.toISOString(),
        invoiceDate.toISOString()
      ).run();

      const invoiceId = invoiceResult.meta?.last_row_id as number;

      // 6. Create invoice item
      await env.DB.prepare(`
        INSERT INTO invoice_items (
          invoice_id, product_name, description, quantity, unit_price, total_price, created_at
        ) VALUES (?, ?, ?, 1, ?, ?, ?)
      `).bind(
        invoiceId,
        'OCUS Job Hunter Premium',
        'Premium access to OCUS Job Hunter extension with unlimited job applications',
        amount,
        amount,
        invoiceDate.toISOString()
      ).run();

      console.log('Invoice created successfully:', { invoiceId, invoiceNumber });

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
