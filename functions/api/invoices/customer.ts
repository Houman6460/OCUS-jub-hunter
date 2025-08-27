import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../lib/context';

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

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return json({ error: 'Customer ID is required' }, 400);
    }

    // Query the database for invoices matching the customerId
    const { results } = await env.DB.prepare(
      'SELECT * FROM invoices WHERE customerId = ? ORDER BY invoiceDate DESC'
    ).bind(customerId).all();

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
