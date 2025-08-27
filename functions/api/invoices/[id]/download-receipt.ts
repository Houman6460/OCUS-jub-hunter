import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../../lib/context';

// Data structures - consistent with receipt.ts
interface Invoice {
  id: number;
  orderId: number;
  invoiceNumber: string;
}

interface Order {
  id: number;
  finalAmount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  completedAt: string;
}

// HTML generation function - duplicated from receipt.ts
function generateReceiptHTML(invoice: Invoice, order: Order, settings: any) {
  const company = settings.company || {
    name: 'OCUS Job Hunter',
    email: 'support@jobhunter.one'
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Receipt for Invoice #${invoice.invoiceNumber}</title>
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; }
        .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .details { margin-top: 20px; }
        .summary { margin-top: 20px; }
        .total-amount { font-size: 1.2em; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Receipt</h1>
        </div>
        <div class="details">
          <p><strong>Receipt #:</strong> RCPT-${invoice.id}</p>
          <p><strong>Payment Date:</strong> ${new Date(order.completedAt).toLocaleDateString()}</p>
          <p><strong>Paid To:</strong> ${company.name}</p>
          <p><strong>Paid By:</strong> ${order.customerName}</p>
        </div>
        <div class="summary">
          <h3>Summary</h3>
          <p>Total Paid: <span class="total-amount">${order.finalAmount.toFixed(2)} ${order.currency}</span></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  try {
    const invoiceId = params.id;

    if (!invoiceId) {
      return new Response('Invoice ID is required', { status: 400 });
    }

    // Fetch data
    const invoice: Invoice = await env.DB.prepare('SELECT * FROM invoices WHERE id = ?').bind(invoiceId).first();
    if (!invoice) return new Response('Invoice not found', { status: 404 });

    const order: Order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(invoice.orderId).first();
    if (!order) return new Response('Associated order not found', { status: 404 });

    const settingsStmt = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind('invoice_settings').first();
    const settings = settingsStmt ? JSON.parse(settingsStmt.value as string) : {};

    const html = generateReceiptHTML(invoice, order, settings);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="receipt-${invoice.invoiceNumber}.html"`,
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    return new Response(`Error generating receipt: ${error.message}`, { status: 500 });
  }
};
