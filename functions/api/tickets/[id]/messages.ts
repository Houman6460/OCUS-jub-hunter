import { TicketStorage, Env } from '../../../lib/db';

interface MessagePayload {
  content?: string;
  message?: string;
  customerEmail?: string;
  customerName?: string;
  isAdmin?: boolean;
}
import { UserStorage } from '../../../lib/user-storage';
import type { D1Database } from '@cloudflare/workers-types';

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
    let attachmentData: string | undefined;

    const ct = request.headers.get('content-type') || '';
    try {
      if (ct.includes('application/json')) {
        const body = await request.json() as MessagePayload;
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
        
        // Process file attachments
        const attachments: Array<{name: string; type: string; size: number}> = [];
        for (const [key, value] of form.entries()) {
          if (key.startsWith('attachment_') && value instanceof File) {
            attachments.push({
              name: value.name,
              type: value.type,
              size: value.size
            });
          }
        }
        
        // Store attachment metadata as JSON string
        if (attachments.length > 0) {
          content = content || '[File attachment]';
          attachmentData = JSON.stringify(attachments);
        }
      } else {
        // Try JSON first, then text fallback
        try {
          const body = await request.json() as MessagePayload;
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
    
    // Allow empty content if there are attachments (files/images)
    const hasAttachments = request.headers.get('content-type')?.includes('multipart/form-data');
    if (!content && !hasAttachments) {
      return json({ success: false, message: 'Missing content' }, 400);
    }
    
    // Set default content for attachment-only messages
    if (!content && hasAttachments) {
      content = '[File attachment]';
    }

    const storage = new TicketStorage(env.DB);
    const ticket = await storage.getTicketById(ticketId);
    // Degrade to 200 to prevent client hard-failures; keep informative payload
    if (!ticket) return json({ success: false, message: 'Ticket not found' }, 200);

    let finalSenderName = customerName;
    
    // If we don't have customerName but have customerEmail, try to fetch from user storage
    if (!customerName && customerEmail && !isAdmin) {
      try {
        const userStorage = new UserStorage(env.DB as D1Database);
        await userStorage.initializeUsers();
        const user = await userStorage.getUserByEmail(customerEmail);
        if (user) {
          finalSenderName = user.name;
        }
      } catch (error) {
        console.error('Failed to fetch user name for message:', error);
      }
    }

    const msg = await storage.addTicketMessage({
      ticket_id: ticketId,
      message: content || '[File attachment]',
      is_from_customer: !isAdmin,
      sender_name: finalSenderName || (isAdmin ? 'Admin' : ticket.customer_name),
      sender_email: customerEmail || (isAdmin ? undefined : ticket.customer_email),
      attachments: attachmentData,
    });

    return json({ success: true, message: msg });
  } catch (error) {
    console.error('Failed to add message:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return json({ success: false, message }, 500);
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
