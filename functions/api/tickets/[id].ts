import { TicketStorage, Env } from '../../lib/db';

interface TicketUpdatePayload {
  status?: string;
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

export const onRequestPatch = async ({ request, params, env }: { request: Request; params: { id: string }; env: Env }) => {
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
    const updates = await request.json() as TicketUpdatePayload;
    const storage = new TicketStorage(env.DB);

    const ticket = await storage.getTicketById(ticketId);
    if (!ticket) return json({ success: false, message: 'Ticket not found' }, 404);

    if (updates.status) {
      await storage.updateTicketStatus(ticketId, updates.status);
    }
    
    const updatedTicket = await storage.getTicketById(ticketId);
    return json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.error('Failed to update ticket:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return json({ success: false, message }, 500);
  }
};

export const onRequestPut = async (ctx: any) => {
  // Reuse proxy and fallback logic from PATCH
  return onRequestPatch(ctx);
};

export const onRequestDelete = async ({ request, params, env }: { request: Request; params: { id: string }; env: Env }) => {
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
    const storage = new TicketStorage(env.DB);
    
    const ticket = await storage.getTicketById(ticketId);
    if (!ticket) {
      return json({ success: false, message: 'Ticket not found' }, 404);
    }
    
    await storage.deleteTicket(ticketId);
    return json({ success: true, message: `Ticket ${ticketId} deleted` });
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return json({ success: false, message }, 500);
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
