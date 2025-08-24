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
        i.invoiceNumber as invoice_number,
        i.orderId as order_id,
        i.amount,
        i.currency,
        i.taxAmount as tax_amount,
        i.status,
        i.invoiceDate as invoice_date,
        i.dueDate as due_date,
        i.paidAt as paid_at,
        i.createdAt as created_at,
        o.productId as product_id,
        o.paymentMethod as payment_method,
        u.name as customer_name,
        u.email as customer_email
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
