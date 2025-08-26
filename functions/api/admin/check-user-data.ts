// Cloudflare Pages Function: /api/admin/check-user-data
// Check user data across all tables for debugging

import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../lib/context';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return json({ success: false, message: 'Email required' }, 400);
    }

    if (!env.DB) {
      return json({ success: false, message: 'Database not available' }, 500);
    }

    // Check users table
    const user = await env.DB.prepare(`
      SELECT id, email, name, is_premium, extension_activated, premium_activated_at, created_at
      FROM users WHERE email = ?
    `).bind(email).first();

    // Check customers table
    const customer = await env.DB.prepare(`
      SELECT id, email, name, is_premium, extension_activated, created_at
      FROM customers WHERE email = ?
    `).bind(email).first();

    // Check orders
    const orders = await env.DB.prepare(`
      SELECT id, customer_id, customer_email, original_amount, final_amount, status, created_at, completed_at
      FROM orders WHERE customer_email = ?
    `).bind(email).all();

    // Check invoices
    const invoices = await env.DB.prepare(`
      SELECT id, invoice_number, customer_id, order_id, amount, status, created_at
      FROM invoices WHERE customer_id IN (
        SELECT id FROM customers WHERE email = ?
        UNION
        SELECT id FROM users WHERE email = ?
      )
    `).bind(email, email).all();

    return json({
      success: true,
      email,
      user,
      customer,
      orders: orders.results,
      invoices: invoices.results,
      summary: {
        userExists: !!user,
        customerExists: !!customer,
        userPremium: user?.is_premium === 1,
        customerPremium: customer?.is_premium === 1,
        userExtensionActivated: user?.extension_activated === 1,
        customerExtensionActivated: customer?.extension_activated === 1,
        totalOrders: orders.results?.length || 0,
        totalInvoices: invoices.results?.length || 0
      }
    });

  } catch (error: any) {
    console.error('Error checking user data:', error);
    return json({ 
      success: false, 
      message: error.message 
    }, 500);
  }
};
