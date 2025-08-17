import { TicketStorage, Env } from '../../lib/db';

function mapStatus(status: string) {
  // Admin UI expects: 'open' | 'in_progress' | 'closed'
  if (status === 'in-progress') return 'in_progress';
  if (status === 'resolved') return 'closed';
  return status || 'open';
}

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
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
    // Clone headers to safely adjust Set-Cookie for the Pages host
    const respHeaders = new Headers(proxied.headers);
    const setCookie = respHeaders.get('set-cookie');
    if (setCookie) {
      // Remove Domain attribute so cookie is scoped to current host (Pages domain)
      const rewritten = setCookie.replace(/;\s*Domain=[^;]+/i, '');
      respHeaders.delete('set-cookie');
      respHeaders.append('set-cookie', rewritten);
    }
    return new Response(proxied.body, { status: proxied.status, headers: respHeaders });
  }

  const storage = new TicketStorage(env.DB);
  const allTickets = await storage.getAllTickets();
  const tickets = allTickets.map((t) => ({
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
