import { Env, getUser } from '../../lib/context';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // Admin authentication check
    const user = await getUser(context.request, context.env);
    if (!user || !user.isAdmin) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Fetch all invoices with customer information for admin
    const invoicesQuery = `
      SELECT 
        i.id,
        i.invoice_number,
        i.order_id,
        i.customer_id,
        i.total_amount,
        i.currency,
        i.status,
        i.invoice_date,
        i.due_date,
        i.pdf_url,
        c.name as customer_name,
        c.email as customer_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY i.invoice_date DESC
    `;

    const invoicesResult = await context.env.DB.prepare(invoicesQuery).all();
    
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
    console.error('Error fetching admin invoices:', error);
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
