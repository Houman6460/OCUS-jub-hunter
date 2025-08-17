import { TicketStorage, Env } from '../../../lib/db';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const onRequestPost = async ({ request, params, env }: { request: Request; params: { id: string }; env: Env }) => {
  try {
    const ticketId = Number(params.id);
    // If EXPRESS_API_BASE is configured, proxy the request to Express (preserves persistence and auth via cookies)
    const expressBase: string | undefined = env?.EXPRESS_API_BASE;
    if (expressBase) {
      const base = expressBase.replace(/\/$/, "");
      const url = `${base}/api/tickets/${ticketId}/messages`;
      const headers: Record<string, string> = {};
      const cookie = request.headers.get('cookie');
      const ct = request.headers.get('content-type');
      const auth = request.headers.get('authorization');
      if (cookie) headers['cookie'] = cookie;
      if (ct) headers['content-type'] = ct;
      if (auth) headers['authorization'] = auth;
      const proxied = await fetch(url, {
        method: 'POST',
        headers,
        body: request.body,
        redirect: 'manual',
      });
      // Rewrite Set-Cookie to scope to current host
      const respHeaders = new Headers(proxied.headers);
      const setCookie = respHeaders.get('set-cookie');
      if (setCookie) {
        const rewritten = setCookie.replace(/;\s*Domain=[^;]+/i, '');
        respHeaders.delete('set-cookie');
        respHeaders.append('set-cookie', rewritten);
      }
      return new Response(proxied.body, { status: proxied.status, headers: respHeaders });
    }
    // Robust body parsing: JSON -> FormData -> Text
    let content: string | undefined;
    let customerEmail: string | undefined;
    let customerName: string | undefined;
    let isAdmin: boolean | undefined;

    const ct = request.headers.get('content-type') || '';
    try {
      if (ct.includes('application/json')) {
        const body = await request.json();
        content = body?.content ?? body?.message;
        customerEmail = body?.customerEmail;
        customerName = body?.customerName;
        isAdmin = !!body?.isAdmin;
      } else if (ct.includes('multipart/form-data')) {
        const form = await request.formData();
        const raw = form.get('content') ?? form.get('message');
        content = typeof raw === 'string' ? raw : undefined;
        const ce = form.get('customerEmail');
        customerEmail = typeof ce === 'string' ? ce : undefined;
        const cn = form.get('customerName');
        customerName = typeof cn === 'string' ? cn : undefined;
        const ia = form.get('isAdmin');
        isAdmin = typeof ia === 'string' ? ia === 'true' : false;
      } else {
        // Try JSON first, then text fallback
        try {
          const body = await request.json();
          content = body?.content ?? body?.message;
          customerEmail = body?.customerEmail;
          customerName = body?.customerName;
          isAdmin = !!body?.isAdmin;
        } catch {
          const text = await request.text();
          // If plain text, treat as content
          content = text || undefined;
        }
      }
    } catch {
      // As last resort, try reading text
      const text = await request.text();
      content = text || undefined;
    }

    content = typeof content === 'string' ? content.trim() : content;
    if (!content) return json({ success: false, message: 'Missing content' }, 400);

    const storage = new TicketStorage(env.DB);
    const ticket = await storage.getTicketById(ticketId);
    // Degrade to 200 to prevent client hard-failures; keep informative payload
    if (!ticket) return json({ success: false, message: 'Ticket not found' }, 200);

    const msg = await storage.addTicketMessage({
      ticket_id: ticketId,
      message: content,
      is_from_customer: !isAdmin,
      sender_name: customerName || (isAdmin ? 'Admin' : ticket.customer_name),
      sender_email: customerEmail || (isAdmin ? undefined : ticket.customer_email),
    });

    return json({ success: true, message: msg });
  } catch (error) {
    return json({ success: false, message: 'Failed to add message' }, 500);
  }
};

export const onRequestGet = async ({ request, params, env }: { request: Request; params: { id: string }; env: Env }) => {
  const ticketId = Number(params.id);
  // If EXPRESS_API_BASE is configured, proxy the GET to Express to read from DB
  const expressBase: string | undefined = env?.EXPRESS_API_BASE;
  if (expressBase) {
    const base = expressBase.replace(/\/$/, "");
    const url = `${base}/api/tickets/${ticketId}/messages`;
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

  const storage = new TicketStorage(env.DB);
  const messages = await storage.getTicketMessages(ticketId);
  // Map to admin UI shape
  const mapped = messages.map((m) => ({
    id: m.id,
    ticketId: m.ticket_id,
    content: m.message,
    isAdmin: !m.is_from_customer,
    authorName: m.sender_name,
    createdAt: m.created_at,
    attachments: [],
  }));
  return json(mapped);
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
