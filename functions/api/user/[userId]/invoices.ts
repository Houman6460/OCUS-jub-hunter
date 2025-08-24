interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { params } = context;
    const userId = params.userId as string;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch user invoices from database with correct user information
    const invoicesQuery = `
      SELECT 
        i.id,
        i.invoiceNumber,
        i.orderId,
        i.amount,
        i.currency,
        i.taxAmount,
        i.status,
        i.invoiceDate,
        i.dueDate,
        i.paidAt,
        i.createdAt,
        o.productId,
        o.paymentMethod,
        u.name as customerName,
        u.email as customerEmail
      FROM invoices i
      LEFT JOIN orders o ON i.orderId = o.id
      LEFT JOIN users u ON o.customerEmail = u.email
      WHERE u.id = ? 
      ORDER BY i.createdAt DESC
    `;

    const invoicesResult = await context.env.DB.prepare(invoicesQuery).bind(userId).all();
    
    return new Response(JSON.stringify(invoicesResult.results || []), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Error fetching user invoices:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch invoices' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
