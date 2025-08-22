import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';

interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  productId?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json() as PaymentIntentRequest;
    const { amount, currency = 'usd', customerEmail, customerName, productId } = body;

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid amount'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Get payment settings from database
    const paymentSettings = await env.DB.prepare(`
      SELECT key, value FROM settings 
      WHERE key LIKE 'payment_%'
    `).all();

    const settings: any = {};
    paymentSettings.results?.forEach((row: any) => {
      const key = row.key.replace('payment_', '');
      let value = row.value;
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      settings[key] = value;
    });

    // Check if Stripe is enabled and configured
    if (!settings.stripeEnabled || !settings.stripeSecretKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment processing not configured'
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Create Stripe payment intent
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100).toString(), // Convert to cents
        currency: currency.toLowerCase(),
        automatic_payment_methods: JSON.stringify({ enabled: true }),
        ...(customerEmail && { receipt_email: customerEmail }),
        ...(productId && { metadata: JSON.stringify({ productId, customerName }) })
      })
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.text();
      console.error('Stripe API error:', errorData);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create payment intent'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const paymentIntent = await stripeResponse.json();

    // Store payment intent in database for tracking
    try {
      await env.DB.prepare(`
        INSERT INTO settings (key, value) 
        VALUES (?, ?)
      `).bind(
        `payment_intent_${paymentIntent.id}`,
        JSON.stringify({
          id: paymentIntent.id,
          amount,
          currency,
          customerEmail,
          customerName,
          productId,
          status: 'created',
          createdAt: new Date().toISOString()
        })
      ).run();
    } catch (dbError) {
      console.warn('Failed to store payment intent in database:', dbError);
    }

    return new Response(JSON.stringify({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: settings.stripePublicKey
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
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
