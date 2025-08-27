import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../../lib/context';

// Helper to return JSON responses
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    // Query the database for all invoices, ordered by most recent
    const { results } = await env.DB.prepare(
      'SELECT * FROM invoices ORDER BY invoiceDate DESC'
    ).all();

    if (!results) {
      return json([]);
    }

    return json(results);

  } catch (error: any) {
    return json({ 
      error: error.message 
    }, 500);
  }
};
