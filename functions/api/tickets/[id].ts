// Shared in-memory store created in index.ts
function getStore() {
  const s: any = (globalThis as any).__TICKET_STORE__;
  if (!s) {
    (globalThis as any).__TICKET_STORE__ = { tickets: [], messages: new Map(), seq: 1, msgSeq: 1 };
  }
  return (globalThis as any).__TICKET_STORE__ as {
    tickets: any[];
    messages: Map<number, any[]>;
    seq: number;
    msgSeq: number;
  };
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const onRequestPatch = async ({ request, params, env }: any) => {
  try {
    const ticketId = Number(params.id);
    const expressBase: string | undefined = env?.EXPRESS_API_BASE;
    if (expressBase) {
      const base = expressBase.replace(/\/$/, "");
      const url = `${base}/api/tickets/${ticketId}`;
      const headers: Record<string, string> = {};
      const cookie = request.headers.get('cookie');
      const ct = request.headers.get('content-type');
      const auth = request.headers.get('authorization');
      if (cookie) headers['cookie'] = cookie;
      if (ct) headers['content-type'] = ct;
      if (auth) headers['authorization'] = auth;
      const proxied = await fetch(url, { method: 'PATCH', headers, body: request.body, redirect: 'manual' });
      const respHeaders = new Headers(proxied.headers);
      const setCookie = respHeaders.get('set-cookie');
      if (setCookie) {
        const rewritten = setCookie.replace(/;\s*Domain=[^;]+/i, '');
        respHeaders.delete('set-cookie');
        respHeaders.append('set-cookie', rewritten);
      }
      return new Response(proxied.body, { status: proxied.status, headers: respHeaders });
    }
    const updates = await request.json();
    const store = getStore();

    const idx = store.tickets.findIndex((t) => t.id === ticketId);
    if (idx === -1) return json({ success: false, message: 'Ticket not found' }, 404);

    const now = new Date().toISOString();
    store.tickets[idx] = { ...store.tickets[idx], ...updates, updated_at: now };
    return json({ success: true, ticket: store.tickets[idx] });
  } catch (error) {
    return json({ success: false, message: 'Failed to update ticket' }, 500);
  }
};

export const onRequestPut = async (ctx: any) => {
  // Reuse proxy and fallback logic from PATCH
  return onRequestPatch(ctx);
};

export const onRequestDelete = async ({ request, params, env }: any) => {
  try {
    const ticketId = Number(params.id);
    const expressBase: string | undefined = env?.EXPRESS_API_BASE;
    if (expressBase) {
      const base = expressBase.replace(/\/$/, "");
      const url = `${base}/api/tickets/${ticketId}`;
      const headers: Record<string, string> = {};
      const cookie = request.headers.get('cookie');
      const auth = request.headers.get('authorization');
      if (cookie) headers['cookie'] = cookie;
      if (auth) headers['authorization'] = auth;
      const proxied = await fetch(url, { method: 'DELETE', headers, redirect: 'manual' });
      const respHeaders = new Headers(proxied.headers);
      const setCookie = respHeaders.get('set-cookie');
      if (setCookie) {
        const rewritten = setCookie.replace(/;\s*Domain=[^;]+/i, '');
        respHeaders.delete('set-cookie');
        respHeaders.append('set-cookie', rewritten);
      }
      return new Response(proxied.body, { status: proxied.status, headers: respHeaders });
    }
    const store = getStore();

    const before = store.tickets.length;
    store.tickets = store.tickets.filter((t) => t.id !== ticketId);
    store.messages.delete(ticketId);
    const removed = before !== store.tickets.length;
    return json({ success: removed, message: removed ? `Ticket ${ticketId} deleted` : 'Ticket not found' }, removed ? 200 : 404);
  } catch (error) {
    return json({ success: false, message: 'Failed to delete ticket' }, 500);
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
