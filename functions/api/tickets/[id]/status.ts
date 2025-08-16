// Update only the status of a ticket: /api/tickets/:id/status

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

function toInternalStatus(input: string) {
  // UI uses: open | in_progress | closed
  // Store uses: open | in-progress | resolved | closed
  if (input === 'in_progress') return 'in-progress';
  if (input === 'closed') return 'closed';
  return input || 'open';
}

export const onRequestPut = async ({ request, params }: any) => {
  try {
    const ticketId = Number(params.id);
    const body = await request.json().catch(() => ({}));
    const status = body?.status;
    if (!status) return json({ success: false, message: 'Missing status' }, 400);

    const store = getStore();
    const idx = store.tickets.findIndex((t) => t.id === ticketId);
    if (idx === -1) return json({ success: false, message: 'Ticket not found' }, 404);

    const now = new Date().toISOString();
    store.tickets[idx] = {
      ...store.tickets[idx],
      status: toInternalStatus(status),
      updated_at: now,
    };

    return json({ success: true, ticket: store.tickets[idx] });
  } catch (e) {
    return json({ success: false, message: 'Failed to update status' }, 500);
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
