import { createInvoicePdf } from '../lib/invoiceToPdf.ts';

export async function onRequestPost(context: any) {
  const { request, env, params } = context;
  const orderId = params.orderId;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if order exists and is completed
    const orderQuery = `
      SELECT 
        id, customer_id, customer_email, customer_name, 
        product_id, final_amount, currency, payment_method,
        status, completed_at, created_at
      FROM orders 
      WHERE id = ? AND status = 'completed'
    `;
    
    const orderResult = await env.DB.prepare(orderQuery).bind(orderId).first();
    
    if (!orderResult) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Order not found or not completed' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Check if invoice already exists
    const existingInvoiceQuery = `
      SELECT id FROM invoices WHERE order_id = ?
    `;
    
    const existingInvoice = await env.DB.prepare(existingInvoiceQuery).bind(orderId).first();
    
    if (existingInvoice) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invoice already exists for this order' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${orderId}`;
    
    // Calculate tax (assuming 0% for now, can be configured)
    const amount = parseFloat(orderResult.final_amount);
    const taxRate = 0.0; // 0% tax
    const taxAmount = amount * taxRate;
    
    // Create invoice
    const createInvoiceQuery = `
      INSERT INTO invoices (
        invoice_number, order_id, customer_id, amount, currency,
        tax_amount, status, invoice_date, paid_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const now = new Date().toISOString();
    
    const invoiceResult = await env.DB.prepare(createInvoiceQuery)
      .bind(
        invoiceNumber,
        orderId,
        orderResult.customer_id,
        orderResult.final_amount,
        orderResult.currency,
        taxAmount.toString(),
        'paid', // Since order is completed, invoice is paid
        orderResult.completed_at || now,
        orderResult.completed_at || now,
        now
      )
      .run();

    if (!invoiceResult.success) {
      throw new Error('Failed to create invoice in DB');
    }

    const newInvoiceId = invoiceResult.meta.last_row_id;

    // --- PDF Generation and Upload ---
    const customerQuery = `SELECT * FROM customers WHERE id = ?`;
    const customer = await env.DB.prepare(customerQuery).bind(orderResult.customer_id).first();

    const itemsQuery = `SELECT * FROM order_items WHERE order_id = ?`;
    const items = await env.DB.prepare(itemsQuery).bind(orderId).all();

    const invoiceDataForPdf = {
      invoice: { ...orderResult, id: newInvoiceId, invoice_number: invoiceNumber, invoice_date: now, status: 'paid', amount: orderResult.final_amount },
      items: items.results,
      customer: customer,
    };

    const pdfBuffer = await createInvoicePdf(invoiceDataForPdf);

    const pdfFileName = `invoices/${invoiceNumber}.pdf`;
    await env.R2_BUCKET.put(pdfFileName, pdfBuffer, {
      httpMetadata: { contentType: 'application/pdf' },
    });

    const pdfUrl = `${env.R2_PUBLIC_URL}/${pdfFileName}`;

    // Update invoice with PDF URL
    const updateInvoiceQuery = `UPDATE invoices SET pdf_url = ? WHERE id = ?`;
    await env.DB.prepare(updateInvoiceQuery).bind(pdfUrl, newInvoiceId).run();

    return new Response(JSON.stringify({ 
      success: true, 
      invoiceId: newInvoiceId,
      invoiceNumber: invoiceNumber,
      pdfUrl: pdfUrl,
      message: 'Invoice created and PDF generated successfully' 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to create invoice' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
