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
    const { content, customerEmail, customerName, isAdmin } = await request.json();
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
  return json(list);
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
