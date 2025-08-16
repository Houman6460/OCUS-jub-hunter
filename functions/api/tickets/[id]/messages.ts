// Use the shared in-memory store created in index.ts
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

export const onRequestPost = async ({ request, params }: any) => {
  try {
    const ticketId = Number(params.id);
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

    const store = getStore();
    const ticket = store.tickets.find((t) => t.id === ticketId);
    if (!ticket) return json({ success: false, message: 'Ticket not found' }, 404);

    const msg = {
      id: store.msgSeq++,
      ticket_id: ticketId,
      message: content,
      is_from_customer: !isAdmin,
      sender_name: customerName || (isAdmin ? 'Admin' : ticket.customer_name),
      sender_email: customerEmail || (isAdmin ? undefined : ticket.customer_email),
      created_at: new Date().toISOString(),
    };

    const list = store.messages.get(ticketId) || [];
    list.push(msg);
    store.messages.set(ticketId, list);

    return json({ success: true, message: msg });
  } catch (error) {
    return json({ success: false, message: 'Failed to add message' }, 500);
  }
};

export const onRequestGet = async ({ params }: any) => {
  const ticketId = Number(params.id);
  const store = getStore();
  const list = store.messages.get(ticketId) || [];
  // Map to admin UI shape
  const mapped = list.map((m: any) => ({
    id: m.id,
    ticketId: m.ticket_id,
    content: m.message,
    isAdmin: !m.is_from_customer,
    authorName: m.sender_name,
    createdAt: m.created_at,
    attachments: m.attachments || [],
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
