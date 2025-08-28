import type { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}
