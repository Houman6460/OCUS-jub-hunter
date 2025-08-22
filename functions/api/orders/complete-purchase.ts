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

    // Create order record
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

    // Create or update user record
    await env.DB.prepare(`
      INSERT OR REPLACE INTO users (
        email, name, isPremium, lastLoginAt, updatedAt
      ) VALUES (?, ?, 1, datetime('now'), datetime('now'))
    `).bind(customerEmail, customerName).run();

    return new Response(JSON.stringify({
      success: true,
      orderId: orderResult.meta?.last_row_id,
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
