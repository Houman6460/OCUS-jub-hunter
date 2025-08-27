import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../../lib/context';

// Data structures - should be consistent with html.ts
interface Invoice {
  id: number;
  orderId: number;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  invoiceDate: string;
  dueDate: string;
}

interface Order {
  id: number;
  productName: string;
  finalAmount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  customerName: string;
  customerEmail: string;
  completedAt: string;
  createdAt: string;
}

// HTML generation function - duplicated from html.ts for simplicity
function generateInvoiceHTML(invoice: Invoice, order: Order, settings: any) {
  const company = settings.company || {
    name: 'OCUS Job Hunter',
    address: 'Digital Services Company',
    email: 'support@jobhunter.one',
    website: 'https://jobhunter.one'
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice #${invoice.invoiceNumber}</title>
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #eee; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; }
        .details { display: flex; justify-content: space-between; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; border: 1px solid #ddd; }
        .totals { margin-top: 20px; text-align: right; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice</h1>
          <div>
            <strong>${company.name}</strong><br>
            ${company.address}<br>
            ${company.email}
          </div>
        </div>
        <div class="details">
          <div>
            <h3>Bill To:</h3>
            ${order.customerName}<br>
            ${order.customerEmail}
          </div>
          <div>
            <h3>Invoice Details:</h3>
            <strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
            <strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${order.productName}</td>
              <td>${order.finalAmount.toFixed(2)} ${order.currency}</td>
            </tr>
          </tbody>
        </table>
        <div class="totals">
          <h3>Total: ${order.finalAmount.toFixed(2)} ${order.currency}</h3>
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

    const html = generateInvoiceHTML(invoice, order, settings);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.html"`,
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    return new Response(`Error generating invoice: ${error.message}`, { status: 500 });
  }
};
