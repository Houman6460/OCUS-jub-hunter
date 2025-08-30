import type { D1Database, Queue } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  // Optional environment variables for payment providers
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  // Optional Cloudflare Queue binding for Stripe events (producer only)
  STRIPE_EVENTS_QUEUE?: Queue<unknown>;
}
