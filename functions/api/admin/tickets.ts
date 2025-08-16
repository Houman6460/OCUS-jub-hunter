// Access shared in-memory store created in /api/tickets/index.ts
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

function mapStatus(status: string) {
  // Admin UI expects: 'open' | 'in_progress' | 'closed'
  if (status === 'in-progress') return 'in_progress';
  if (status === 'resolved') return 'closed';
  return status || 'open';
}

export const onRequestGet = async ({ request, env }: any) => {
  const expressBase: string | undefined = env?.EXPRESS_API_BASE;
  if (expressBase) {
    const base = expressBase.replace(/\/$/, "");
    const url = `${base}/api/admin/tickets`;
    const headers: Record<string, string> = {};
    const cookie = request.headers.get('cookie');
    const auth = request.headers.get('authorization');
    if (cookie) headers['cookie'] = cookie;
    if (auth) headers['authorization'] = auth;
    const proxied = await fetch(url, { headers, redirect: 'manual' });
    return new Response(proxied.body, { status: proxied.status, headers: proxied.headers });
  }

  const store = getStore();
  const tickets = (store.tickets || []).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: mapStatus(t.status),
    priority: t.priority,
    userId: t.assigned_to_user_id || 0,
    userName: t.customer_name,
    userEmail: t.customer_email,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));

  return new Response(JSON.stringify(tickets), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
