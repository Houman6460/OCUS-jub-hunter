// Cloudflare Pages Function: /api/debug-db
// A temporary endpoint for securely querying the database for debugging purposes.

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';

const DEBUG_AUTH_KEY = 'super-secret-debug-key-for-db';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Keep it open for local dev
    },
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const authKey = request.headers.get('X-Debug-Auth-Key');
    if (authKey !== DEBUG_AUTH_KEY) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json<{ query?: string }>();
    const { query } = body;

    if (!query) {
      return json({ error: 'Query is required' }, 400);
    }

    if (!env.DB) {
      return json({ error: 'Database not available' }, 500);
    }

    const statement = env.DB.prepare(query);
    const result = await statement.all();

    return json(result);

  } catch (error: any) {
    console.error('Error in /api/debug-db:', error);
    return json({ error: error.message }, 500);
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Debug-Auth-Key',
    },
  });
};
