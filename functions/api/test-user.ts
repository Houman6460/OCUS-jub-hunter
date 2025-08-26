// Simple test endpoint to check user data
import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../lib/context';

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
    const email = url.searchParams.get('email') || 'heshmat@gmail.com';

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

    // Check orders for both user_id and customer_id
    const ordersUserQuery = await env.DB.prepare(`
      SELECT id, customer_id, customer_email, original_amount, final_amount, status, created_at, completed_at
      FROM orders WHERE customer_email = ?
    `).bind(email).all();

    const ordersCustomerQuery = customer ? await env.DB.prepare(`
      SELECT id, customer_id, customer_email, original_amount, final_amount, status, created_at, completed_at
      FROM orders WHERE customer_id = ?
    `).bind(customer.id).all() : { results: [] };

    return json({
      success: true,
      email,
      user,
      customer,
      ordersFromEmail: ordersUserQuery.results,
      ordersFromCustomerId: ordersCustomerQuery.results,
      summary: {
        userExists: !!user,
        customerExists: !!customer,
        userPremium: user?.is_premium === 1,
        customerPremium: customer?.is_premium === 1,
        userExtensionActivated: user?.extension_activated === 1,
        customerExtensionActivated: customer?.extension_activated === 1,
        totalOrdersFromEmail: ordersUserQuery.results?.length || 0,
        totalOrdersFromCustomerId: ordersCustomerQuery.results?.length || 0
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
