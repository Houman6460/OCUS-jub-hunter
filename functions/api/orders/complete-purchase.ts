import { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

interface CompletePurchaseRequest {
  paymentIntentId: string;
  customerEmail: string;
  customerName: string;
  amount: number;
  currency: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json() as CompletePurchaseRequest;
    const { paymentIntentId, customerEmail, customerName, amount, currency } = body;

    if (!paymentIntentId || !customerEmail || !customerName || !amount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Generate unique tokens
    const downloadToken = crypto.randomUUID();
    const activationCode = Math.random().toString(36).substring(2, 15).toUpperCase();
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    let orderId = null;

    try {
      // Try to create order record if orders table exists
      const orderResult = await env.DB.prepare(`
        INSERT INTO orders (
          customerEmail, customerName, productId, productName,
          originalAmount, finalAmount, currency, status, paymentMethod,
          paymentIntentId, downloadToken, activationCode, invoiceNumber,
          completedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        customerEmail,
        customerName,
        1, // Product ID for OCUS Extension
        'OCUS Job Hunter Extension',
        amount,
        amount,
        currency.toUpperCase(),
        'completed',
        'stripe',
        paymentIntentId,
        downloadToken,
        activationCode,
        invoiceNumber
      ).run();
      
      orderId = orderResult.meta?.last_row_id;
    } catch (dbError) {
      console.log('Orders table not found, using fallback storage:', dbError);
      // Fallback: Store in settings table as JSON
      const orderData = {
        id: Date.now(),
        customerEmail,
        customerName,
        productId: 1,
        productName: 'OCUS Job Hunter Extension',
        originalAmount: amount,
        finalAmount: amount,
        currency: currency.toUpperCase(),
        status: 'completed',
        paymentMethod: 'stripe',
        paymentIntentId,
        downloadToken,
        activationCode,
        invoiceNumber,
        completedAt: new Date().toISOString()
      };
      
      // Store in settings table
      const settingsKey = `order_${paymentIntentId}`;
      await env.DB.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
      `).bind(settingsKey, JSON.stringify(orderData)).run();
      
      orderId = orderData.id;
    }

    try {
      // Try to create or update user record if users table exists
      await env.DB.prepare(`
        INSERT OR REPLACE INTO users (
          email, name, isPremium, lastLoginAt, updatedAt
        ) VALUES (?, ?, 1, datetime('now'), datetime('now'))
      `).bind(customerEmail, customerName).run();
    } catch (userDbError) {
      console.log('Users table not found, using fallback storage:', userDbError);
      // Fallback: Store user in settings table
      const userData = {
        email: customerEmail,
        name: customerName,
        isPremium: true,
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const userSettingsKey = `user_${customerEmail.replace('@', '_at_').replace('.', '_dot_')}`;
      await env.DB.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
      `).bind(userSettingsKey, JSON.stringify(userData)).run();
    }

    return new Response(JSON.stringify({
      success: true,
      orderId,
      downloadToken,
      activationCode,
      invoiceNumber,
      message: 'Purchase completed successfully'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error completing purchase:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to complete purchase',
      details: String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
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
