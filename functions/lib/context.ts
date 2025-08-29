import type { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  // Optional environment variables for payment providers
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}
