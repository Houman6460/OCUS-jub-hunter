import type { PagesFunction, HeadersInit } from '@cloudflare/workers-types';
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

    // Log the received data for debugging
    console.log('Payment intent request:', { amount, currency, customerEmail, productId });

    // Convert amount to number and validate
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      console.error('Invalid amount received:', { amount, numericAmount, type: typeof amount });
      return new Response(JSON.stringify({
        success: false,
        error: `Invalid amount: ${amount}. Must be a positive number.`
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } as HeadersInit
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
      console.error('Stripe configuration missing:', {
        stripeEnabled: settings.stripeEnabled,
        hasSecretKey: !!settings.stripeSecretKey,
        hasPublicKey: !!settings.stripePublicKey
      });
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment processing not configured. Please contact support.',
        details: 'Stripe payment gateway is not properly configured'
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } as HeadersInit
      });
    }

    // Validate Stripe keys format
    if (!settings.stripeSecretKey.startsWith('sk_')) {
      console.error('Invalid Stripe secret key format');
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid payment configuration'
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } as HeadersInit
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
        amount: Math.round(numericAmount * 100).toString(), // Convert to cents
        currency: currency.toLowerCase(),
        'automatic_payment_methods[enabled]': 'true',
        ...(customerEmail && { receipt_email: customerEmail }),
        ...(productId && { 'metadata[productId]': productId, 'metadata[customerName]': customerName || '' })
      })
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.text();
      console.error('Stripe API error:', {
        status: stripeResponse.status,
        statusText: stripeResponse.statusText,
        errorData,
        requestData: {
          amount: Math.round(numericAmount * 100),
          currency: currency.toLowerCase(),
          hasSecretKey: !!settings.stripeSecretKey,
          secretKeyPrefix: settings.stripeSecretKey?.substring(0, 12) + '...'
        }
      });
      
      // Parse Stripe error for more details
      let stripeError;
      try {
        stripeError = JSON.parse(errorData);
      } catch {
        stripeError = { message: errorData };
      }
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create payment intent',
        details: stripeError.error?.message || stripeError.message || 'Unknown Stripe error',
        stripeErrorType: stripeError.error?.type,
        stripeErrorCode: stripeError.error?.code
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } as HeadersInit
      });
    }

    const paymentIntent = await stripeResponse.json() as {
      id: string;
      client_secret: string;
      amount: number;
      currency: string;
      status: string;
    };

    // Store payment intent in database for tracking
    try {
      await env.DB.prepare(`
        INSERT INTO settings (key, value) 
        VALUES (?, ?)
      `).bind(
        `payment_intent_${paymentIntent.id}`,
        JSON.stringify({
          id: paymentIntent.id,
          amount: numericAmount,
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
      } as HeadersInit
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
      } as HeadersInit
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    } as HeadersInit
  });
};
