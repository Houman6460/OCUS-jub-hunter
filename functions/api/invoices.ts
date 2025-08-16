export const onRequestGet = async ({ request }: any) => {
  const url = new URL(request.url);
  const customerId = url.searchParams.get('customerId');
  
  // Demo invoices
  const invoices = [
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      customerId: customerId || 'demo-customer-123',
      amount: 49.99,
      currency: 'USD',
      status: 'paid',
      dueDate: '2024-03-15',
      createdAt: '2024-02-15',
      items: [
        { description: 'Premium Subscription - Monthly', amount: 49.99 }
      ]
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      customerId: customerId || 'demo-customer-123',
      amount: 99.99,
      currency: 'USD',
      status: 'pending',
      dueDate: '2024-04-15',
      createdAt: '2024-03-15',
      items: [
        { description: 'Premium Subscription - Quarterly', amount: 99.99 }
      ]
    }
  ];

  return new Response(JSON.stringify(invoices), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
