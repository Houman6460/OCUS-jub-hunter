// Simple in-memory invoice store (demo)
function getInvoiceStore() {
  const g: any = globalThis as any;
  if (!g.__INVOICE_STORE__) {
    g.__INVOICE_STORE__ = {
      invoices: [] as any[],
      seq: 1,
    };
  }
  return g.__INVOICE_STORE__ as { invoices: any[]; seq: number };
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

// Map internal invoice to UI shape expected by client/src/components/admin/InvoiceManagement.tsx
function mapToUi(inv: any) {
  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customerId: inv.customerId,
    customerName: inv.customerName,
    customerEmail: inv.customerEmail,
    invoiceDate: inv.invoiceDate,
    dueDate: inv.dueDate,
    subtotal: inv.subtotal,
    totalAmount: inv.totalAmount,
    currency: inv.currency,
    status: inv.status,
    paidAt: inv.paidAt,
    notes: inv.notes,
  };
}

export const onRequestGet = async ({ request }: any) => {
  const url = new URL(request.url);
  const customerId = url.searchParams.get('customerId');
  const store = getInvoiceStore();

  // Seed with a demo invoice if empty to ensure UI has something to render
  if (store.invoices.length === 0) {
    const now = new Date();
    const createdAt = now.toISOString();
    const due = new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString();
    const demo = {
      id: store.seq++,
      invoiceNumber: 'INV-2024-001',
      customerId: customerId || 'demo-customer-123',
      customerName: 'Demo Customer',
      customerEmail: 'demo@example.com',
      invoiceDate: createdAt,
      dueDate: due,
      subtotal: '49.99',
      totalAmount: '49.99',
      currency: 'USD',
      status: 'paid',
      paidAt: createdAt,
      notes: 'Thank you for your purchase.',
      items: [
        { productName: 'Premium Subscription - Monthly', description: '', quantity: 1, unitPrice: 49.99 },
      ],
    };
    store.invoices.push(demo);
  }

  let result = store.invoices;
  if (customerId) {
    result = result.filter((i) => i.customerId === customerId);
  }
  return json(result.map(mapToUi));
};

export const onRequestPost = async ({ request }: any) => {
  try {
    const body = await request.json();
    const {
      customerId,
      customerName,
      customerEmail,
      notes,
      items,
      currency = 'USD',
    } = body || {};

    if (!customerId || !customerName || !customerEmail || !Array.isArray(items) || items.length === 0) {
      return json({ success: false, message: 'Missing required fields' }, 400);
    }

    // Compute totals
    const subtotalNum = items.reduce((sum: number, it: any) => {
      const qty = Number(it.quantity || 0);
      const price = Number(it.unitPrice || 0);
      return sum + qty * price;
    }, 0);

    const store = getInvoiceStore();
    const id = store.seq++;
    const now = new Date();
    const invoiceDate = now.toISOString();
    const dueDate = new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString();
    const invoiceNumber = `INV-${now.getFullYear()}-${String(id).padStart(3, '0')}`;

    const inv = {
      id,
      invoiceNumber,
      customerId,
      customerName,
      customerEmail,
      invoiceDate,
      dueDate,
      subtotal: subtotalNum.toFixed(2),
      totalAmount: subtotalNum.toFixed(2),
      currency,
      status: 'issued',
      notes: notes || '',
      items,
    };

    store.invoices.push(inv);
    return json({ success: true, invoice: mapToUi(inv) }, 201);
  } catch (e) {
    return json({ success: false, message: 'Failed to create invoice' }, 500);
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
