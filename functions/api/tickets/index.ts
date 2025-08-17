// Cloudflare Pages Function: /api/tickets
// Uses D1 database for persistent ticket storage

import { TicketStorage, Env } from '../../lib/db';
import { UserStorage } from '../../lib/user-storage';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const expressBase: string | undefined = env?.EXPRESS_API_BASE;
  if (expressBase) {
    const base = expressBase.replace(/\/$/, "");
    const urlObj = new URL(request.url);
    const qs = urlObj.search ? urlObj.search : '';
    const url = `${base}/api/tickets${qs}`;
    const headers: Record<string, string> = {};
    const cookie = request.headers.get('cookie');
    const auth = request.headers.get('authorization');
    if (cookie) headers['cookie'] = cookie;
    if (auth) headers['authorization'] = auth;
    const proxied = await fetch(url, { headers, redirect: 'manual' });
    const respHeaders = new Headers(proxied.headers);
    const setCookie = respHeaders.get('set-cookie');
    if (setCookie) {
      const rewritten = setCookie.replace(/;\s*Domain=[^;]+/i, '');
      respHeaders.delete('set-cookie');
      respHeaders.append('set-cookie', rewritten);
    }
    return new Response(proxied.body, { status: proxied.status, headers: respHeaders });
  }

  const url = new URL(request.url);
  const isAdmin = url.searchParams.get('isAdmin') === 'true';
  const customerEmail = url.searchParams.get('customerEmail');

  // Check if D1 database is available
  if (!env.DB) {
    console.error('D1 database not available');
    return json({ error: 'Database not available' }, 500);
  }

  try {
    const storage = new TicketStorage(env.DB);
    let result;
    if (!isAdmin && customerEmail) {
      result = await storage.getTicketsByCustomerEmail(customerEmail);
    } else {
      result = await storage.getAllTickets();
    }
    return json(result);
  } catch (error: any) {
    console.error('Database error:', error);
    return json({ error: 'Database query failed', details: error.message }, 500);
  }
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const expressBase: string | undefined = env?.EXPRESS_API_BASE;
    if (expressBase) {
      const base = expressBase.replace(/\/$/, "");
      const url = `${base}/api/tickets`;
      const headers: Record<string, string> = {};
      const cookie = request.headers.get('cookie');
      const ct = request.headers.get('content-type');
      const auth = request.headers.get('authorization');
      if (cookie) headers['cookie'] = cookie;
      if (ct) headers['content-type'] = ct;
      if (auth) headers['authorization'] = auth;
      const proxied = await fetch(url, { method: 'POST', headers, body: request.body, redirect: 'manual' });
      const respHeaders = new Headers(proxied.headers);
      const setCookie = respHeaders.get('set-cookie');
      if (setCookie) {
        const rewritten = setCookie.replace(/;\s*Domain=[^;]+/i, '');
        respHeaders.delete('set-cookie');
        respHeaders.append('set-cookie', rewritten);
      }
      return new Response(proxied.body, { status: proxied.status, headers: respHeaders });
    }
    const body = await request.json();
    const { title, description, category, priority, customerEmail, customerName, customerId } = body || {};
    if (!title || !description || !customerEmail) {
      return json({ success: false, message: 'Missing required fields' }, 400);
    }

    // Check if D1 database is available
    if (!env.DB) {
      console.error('D1 database not available for ticket creation');
      return json({ success: false, message: 'Database not available' }, 500);
    }

    const storage = new TicketStorage(env.DB);
    let finalCustomerName = customerName;
    
    // If we have customerId but no customerName, fetch from user storage
    if (customerId && !customerName) {
      try {
        const userStorage = new UserStorage(env.DB);
        await userStorage.initializeUsers();
        const user = await userStorage.getUserById(parseInt(customerId));
        if (user) {
          finalCustomerName = user.name;
        }
      } catch (error) {
        console.error('Failed to fetch user name:', error);
      }
    }

    const ticket = await storage.createTicket({
      title,
      description,
      category: category || 'general',
      priority: priority || 'medium',
      status: 'open',
      customer_email: customerEmail,
      customer_name: finalCustomerName || customerEmail,
    });

    return json({ success: true, ticket });
  } catch (e: any) {
    console.error('Failed to create ticket:', e);
    return json({ success: false, message: 'Failed to create ticket' }, 500);
  }
};
