// Cloudflare Pages Function: /api/invoices
// Handles invoice retrieval

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env, getUser, getD1, getCustomer } from '../lib/context';

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
    const user = await getUser(request, env);
    if (!user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const db = getD1(env);
    const customer = await getCustomer(db, user.id);

    if (!customer) {
      return json({ error: 'Customer not found' }, 404);
    }

    const invoicesQuery = `
      SELECT 
        i.id, i.invoice_number, i.invoice_date, i.due_date, 
        i.total_amount, i.currency, i.status, i.pdf_url
      FROM invoices i
      WHERE i.customer_id = ?
      ORDER BY i.invoice_date DESC
    `;

    const { results } = await db.prepare(invoicesQuery).bind(customer.id).all();

    return json(results || []);

  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return json({ 
      error: 'Failed to fetch invoices',
      details: error.message 
    }, 500);
  }
};
