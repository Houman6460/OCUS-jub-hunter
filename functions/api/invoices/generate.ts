import { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');
    const invoiceNumber = url.searchParams.get('invoiceNumber');

    if (!orderId && !invoiceNumber) {
      return new Response(JSON.stringify({ error: 'Order ID or Invoice Number is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Fetch order details
    let query = 'SELECT * FROM orders WHERE ';
    let param = '';
    
    if (orderId) {
      query += 'id = ?';
      param = orderId;
    } else {
      query += 'invoiceNumber = ?';
      param = invoiceNumber;
    }

    const order = await env.DB.prepare(query).bind(param).first();

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Generate invoice data
    const invoice = {
      invoiceNumber: order.invoiceNumber,
      orderId: order.id,
      issueDate: order.completedAt || order.createdAt,
      dueDate: order.completedAt || order.createdAt,
      
      // Company details
      company: {
        name: 'OCUS Job Hunter',
        address: 'Digital Services Company',
        email: 'support@jobhunter.one',
        website: 'https://jobhunter.one'
      },
      
      // Customer details
      customer: {
        name: order.customerName,
        email: order.customerEmail
      },
      
      // Items
      items: [{
        description: order.productName,
        quantity: 1,
        unitPrice: order.finalAmount,
        total: order.finalAmount
      }],
      
      // Totals
      subtotal: order.finalAmount,
      tax: 0,
      total: order.finalAmount,
      currency: order.currency,
      
      // Payment details
      paymentMethod: order.paymentMethod,
      paymentStatus: order.status,
      activationCode: order.activationCode,
      downloadToken: order.downloadToken
    };

    return new Response(JSON.stringify({
      success: true,
      invoice: invoice
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error generating invoice:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate invoice',
      details: String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
