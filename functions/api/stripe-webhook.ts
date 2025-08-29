import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';

// Utility: constant-time string comparison
function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    const h = bytes[i].toString(16).padStart(2, '0');
    hex += h;
  }
  return hex;
}

function parseStripeSignatureHeader(header: string | null) {
  if (!header) return null;
  const parts = header.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});
  if (!parts['t'] || !parts['v1']) return null;
  return { t: parts['t'], v1: parts['v1'] };
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return toHex(signature);
}

async function getWebhookSecret(env: Env): Promise<string | null> {
  try {
    // Try DB-backed settings first (consistent with other payment settings usage)
    const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('payment_stripeWebhookSecret')
      .first<{ value: string }>();
    if (row && row.value) {
      return typeof row.value === 'string' ? row.value : String(row.value);
    }
  } catch (e) {
    // Fall back to env var if settings lookup fails
  }
  return (env as any).STRIPE_WEBHOOK_SECRET || null;
}

async function updatePaymentIntentStatus(env: Env, paymentIntentId: string, status: string, completed: boolean) {
  const now = new Date().toISOString();
  const key = `payment_intent_${paymentIntentId}`;

  try {
    const existing = await env.DB.prepare('SELECT id, value FROM settings WHERE key = ?')
      .bind(key)
      .first<{ id: number; value: string }>();

    if (existing) {
      let payload: any;
      try {
        payload = JSON.parse(existing.value || '{}');
      } catch {
        payload = { raw: existing.value };
      }
      payload.status = status;
      payload.updatedAt = now;

      await env.DB.prepare('UPDATE settings SET value = ?, updated_at = ? WHERE id = ?')
        .bind(JSON.stringify(payload), now, existing.id)
        .run();
    }
  } catch (err) {
    console.warn('Failed to update settings payment intent record:', err);
  }

  // Best-effort update orders if such a record exists
  try {
    if (completed) {
      await env.DB.prepare('UPDATE orders SET status = ?, completedAt = ? WHERE paymentIntentId = ?')
        .bind('completed', now, paymentIntentId)
        .run();
    } else {
      await env.DB.prepare('UPDATE orders SET status = ? WHERE paymentIntentId = ?')
        .bind(status, paymentIntentId)
        .run();
    }
  } catch (err) {
    console.warn('Failed to update order status:', err);
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const sigHeader = request.headers.get('stripe-signature');
    const parsed = parseStripeSignatureHeader(sigHeader);
    if (!parsed) {
      return new Response(JSON.stringify({ success: false, error: 'Missing or invalid Stripe-Signature header' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const secret = await getWebhookSecret(env);
    if (!secret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response(JSON.stringify({ success: false, error: 'Webhook not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Read raw payload for signature verification
    const rawBody = await request.text();

    // Optional: timestamp tolerance (5 minutes)
    const tolerance = 300; // seconds
    const nowSec = Math.floor(Date.now() / 1000);
    const ts = parseInt(parsed.t, 10);
    if (Number.isFinite(ts) && Math.abs(nowSec - ts) > tolerance) {
      return new Response(JSON.stringify({ success: false, error: 'Signature timestamp outside tolerance' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const signedPayload = `${parsed.t}.${rawBody}`;
    const expected = await signPayload(signedPayload, secret);
    if (!constantTimeEqual(expected, parsed.v1)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const type: string = event?.type;
    const pi: any = event?.data?.object;

    if (!type || !pi?.id) {
      return new Response(JSON.stringify({ success: false, error: 'Malformed Stripe event' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    switch (type) {
      case 'payment_intent.succeeded': {
        await updatePaymentIntentStatus(env, pi.id, 'succeeded', true);
        break;
      }
      case 'payment_intent.payment_failed': {
        await updatePaymentIntentStatus(env, pi.id, 'failed', false);
        break;
      }
      case 'payment_intent.canceled': {
        await updatePaymentIntentStatus(env, pi.id, 'canceled', false);
        break;
      }
      default: {
        // Acknowledge other events without action
        console.log('Unhandled Stripe event type:', type);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature'
    }
  });
};
