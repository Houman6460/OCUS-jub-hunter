import type { PagesFunction, HeadersInit } from '@cloudflare/workers-types';
import { Env } from '../lib/context';

interface PaymentIntentRequest {
  amount: number | string;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  productId?: string;
  // The checkout page may send these; we accept and forward some as metadata (best-effort)
  couponCode?: string | null;
  originalAmount?: number | string;
  discountAmount?: number | string;
  referralCode?: string | null;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json() as PaymentIntentRequest;
    const {
      amount,
      currency = 'usd',
      customerEmail,
      customerName,
      productId,
      couponCode,
      originalAmount,
      discountAmount,
      referralCode,
    } = body;

    // Log incoming request (without sensitive keys)
    console.log('create-payment-intent request:', {
      amount,
      currency,
      hasEmail: !!customerEmail,
      productId,
      hasCoupon: !!couponCode,
      hasReferral: !!referralCode,
    });

    // Normalize/validate amount
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      console.error('Invalid amount received:', { amount, numericAmount, type: typeof amount });
      return new Response(
        JSON.stringify({ success: false, error: `Invalid amount: ${amount}. Must be a positive number.` }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } as HeadersInit,
        },
      );
    }

    // Load payment settings from D1 settings table
    const paymentSettings = await env.DB.prepare(
      `SELECT key, value FROM settings WHERE key LIKE 'payment_%'`
    ).all();

    const settings: Record<string, any> = {};
    paymentSettings.results?.forEach((row: any) => {
      const key = row.key.replace('payment_', '');
      let value = row.value;
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      settings[key] = value;
    });

    // Ensure Stripe is configured
    if (!settings.stripeEnabled || !settings.stripeSecretKey) {
      console.error('Stripe configuration missing:', {
        stripeEnabled: settings.stripeEnabled,
        hasSecretKey: !!settings.stripeSecretKey,
        hasPublicKey: !!settings.stripePublicKey,
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment processing not configured. Please contact support.',
          details: 'Stripe payment gateway is not properly configured',
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } as HeadersInit,
        },
      );
    }

    // Validate secret key format (basic check)
    if (typeof settings.stripeSecretKey !== 'string' || !settings.stripeSecretKey.startsWith('sk_')) {
      console.error('Invalid Stripe secret key format');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid payment configuration' }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } as HeadersInit,
        },
      );
    }

    // Build metadata (only include defined values)
    const metadata: Record<string, string> = {};
    if (productId) metadata['productId'] = String(productId);
    if (customerName) metadata['customerName'] = String(customerName);
    if (couponCode) metadata['couponCode'] = String(couponCode);
    if (typeof originalAmount !== 'undefined') metadata['originalAmount'] = String(originalAmount);
    if (typeof discountAmount !== 'undefined') metadata['discountAmount'] = String(discountAmount);
    if (referralCode) metadata['referralCode'] = String(referralCode);

    const form = new URLSearchParams({
      amount: Math.round(numericAmount * 100).toString(), // cents
      currency: currency.toLowerCase(),
      'automatic_payment_methods[enabled]': 'true',
    });
    if (customerEmail) form.set('receipt_email', customerEmail);
    for (const [k, v] of Object.entries(metadata)) {
      form.set(`metadata[${k}]`, v);
    }

    // Create payment intent via Stripe REST API
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      let stripeError: any;
      try {
        stripeError = JSON.parse(errorText);
      } catch {
        stripeError = { message: errorText };
      }
      console.error('Stripe API error creating payment intent:', {
        status: stripeResponse.status,
        statusText: stripeResponse.statusText,
        stripeError,
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create payment intent',
          details: stripeError?.error?.message || stripeError?.message || 'Unknown Stripe error',
          stripeErrorType: stripeError?.error?.type,
          stripeErrorCode: stripeError?.error?.code,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } as HeadersInit,
        },
      );
    }

    const paymentIntent = (await stripeResponse.json()) as {
      id: string;
      client_secret: string;
      amount: number;
      currency: string;
      status: string;
    };

    // Best-effort: store a record for debugging/tracking
    try {
      await env.DB.prepare(
        `INSERT INTO settings (key, value) VALUES (?, ?)`
      )
        .bind(
          `payment_intent_${paymentIntent.id}`,
          JSON.stringify({
            id: paymentIntent.id,
            amount: numericAmount,
            currency,
            customerEmail,
            customerName,
            productId,
            couponCode,
            originalAmount,
            discountAmount,
            referralCode,
            status: 'created',
            createdAt: new Date().toISOString(),
          }),
        )
        .run();
    } catch (dbError) {
      console.warn('Failed to store payment intent in DB (non-fatal):', dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        publishableKey: settings.stripePublicKey,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } as HeadersInit,
      },
    );
  } catch (error) {
    console.error('create-payment-intent error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } as HeadersInit,
      },
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    } as HeadersInit,
  });
};
