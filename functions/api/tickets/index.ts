// Cloudflare Pages Function: /api/tickets
// Demo in-memory store to keep tickets/messages available across requests in the same worker
// For production, replace with a real database (e.g., D1/Postgres via API)

interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  customer_email: string;
  customer_name: string;
  created_at: string;
  updated_at: string;
  assigned_to_user_id?: number;
  assigned_to_name?: string;
}

interface TicketMessage {
  id: number;
  ticket_id: number;
  message: string;
  is_from_customer: boolean;
  sender_name: string;
  sender_email?: string;
  created_at: string;
}

const store = (globalThis as any).__TICKET_STORE__ || {
  tickets: [] as Ticket[],
  messages: new Map<number, TicketMessage[]>(),
  seq: 1,
  msgSeq: 1,
};
(globalThis as any).__TICKET_STORE__ = store;

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

export const onRequestGet = async ({ request, env }: any) => {
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
    return new Response(proxied.body, { status: proxied.status, headers: proxied.headers });
  }

  const url = new URL(request.url);
  const isAdmin = url.searchParams.get('isAdmin') === 'true';
  const customerEmail = url.searchParams.get('customerEmail');

  let result = store.tickets;
  if (!isAdmin && customerEmail) {
    result = result.filter((t) => t.customer_email === customerEmail);
  }
  return json(result);
};

export const onRequestPost = async ({ request, env }: any) => {
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
      return new Response(proxied.body, { status: proxied.status, headers: proxied.headers });
    }
    const body = await request.json();
    const { title, description, category, priority, customerEmail, customerName } = body || {};
    if (!title || !description || !customerEmail) {
      return json({ success: false, message: 'Missing required fields' }, 400);
    }

    const now = new Date().toISOString();
    const ticket: Ticket = {
      id: store.seq++,
      title,
      description,
      category: category || 'general',
      priority: priority || 'medium',
      status: 'open',
      customer_email: customerEmail,
      customer_name: customerName || customerEmail,
      created_at: now,
      updated_at: now,
    };

    store.tickets.unshift(ticket);
    store.messages.set(ticket.id, []);

    return json({ success: true, ticket });
  } catch (e) {
    return json({ success: false, message: 'Failed to create ticket' }, 500);
  }
};
