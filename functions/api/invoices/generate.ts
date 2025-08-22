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

    let order = null;

    try {
      // Try to fetch from orders table first
      const orderQuery = orderId 
        ? `SELECT * FROM orders WHERE id = ?`
        : `SELECT * FROM orders WHERE invoiceNumber = ?`;
      
      order = await env.DB.prepare(orderQuery)
        .bind(orderId || invoiceNumber)
        .first();
    } catch (dbError) {
      console.log('Orders table not found, checking fallback storage:', dbError);
      
      // Fallback: Get orders from settings table
      const settingsResults = await env.DB.prepare(`
        SELECT key, value FROM settings 
        WHERE key LIKE 'order_%'
      `).all();
      
      for (const setting of (settingsResults.results || [])) {
        try {
          const orderData = JSON.parse(setting.value as string);
          if ((orderId && orderData.id == orderId) || 
              (invoiceNumber && orderData.invoiceNumber === invoiceNumber)) {
            order = orderData;
            break;
          }
        } catch (parseError) {
          console.log('Error parsing order data:', parseError);
        }
      }
    }

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
    const invoiceData = {
      invoiceNumber: order.invoiceNumber || '',
      orderId: order.id,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
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
      invoice: invoiceData
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
