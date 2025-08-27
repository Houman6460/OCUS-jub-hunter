import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../../lib/context';

// Invoice and Order data structures (inferred from generate.ts)
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
  activationCode: string;
  downloadToken: string;
  customerName: string;
  customerEmail: string;
  completedAt: string;
  createdAt: string;
}

// Main function to generate invoice HTML
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${invoice.invoiceNumber}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
        .container { max-width: 800px; margin: 20px auto; padding: 30px; background-color: #fff; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #eee; }
        .header h1 { font-size: 2.5em; color: #000; margin: 0; }
        .header .company-details { text-align: right; font-size: 0.9em; color: #555; }
        .details { display: flex; justify-content: space-between; margin-top: 30px; }
        .details .customer-details, .details .invoice-details { font-size: 0.95em; }
        .details h3 { margin-top: 0; font-size: 1.1em; color: #000; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 30px; }
        th, td { padding: 12px 15px; text-align: left; }
        thead { background-color: #f5f5f5; border-bottom: 2px solid #ddd; }
        th { font-weight: 600; color: #333; }
        tbody tr { border-bottom: 1px solid #eee; }
        .totals { margin-top: 30px; text-align: right; }
        .totals table { width: auto; float: right; }
        .totals td { text-align: right; }
        .totals .total-amount { font-size: 1.4em; font-weight: bold; color: #000; }
        .footer { margin-top: 40px; text-align: center; font-size: 0.85em; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
        .status { font-size: 1.2em; font-weight: bold; padding: 8px 12px; border-radius: 6px; text-transform: uppercase; }
        .status.paid { color: #28a745; background-color: #e9f7ec; }
        .status.pending { color: #ffc107; background-color: #fff8e1; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice</h1>
          <div class="company-details">
            <strong>${company.name}</strong><br>
            ${company.address}<br>
            ${company.email}<br>
            ${company.website}
          </div>
        </div>
        <div class="details">
          <div class="customer-details">
            <h3>Bill To:</h3>
            <strong>${order.customerName}</strong><br>
            ${order.customerEmail}
          </div>
          <div class="invoice-details">
            <h3>Invoice Details:</h3>
            <strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
            <strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}<br>
            <strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}<br>
            <strong>Status:</strong> <span class="status ${invoice.status.toLowerCase()}">${invoice.status}</span>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${order.productName}</td>
              <td>1</td>
              <td>${order.finalAmount.toFixed(2)} ${order.currency}</td>
              <td>${order.finalAmount.toFixed(2)} ${order.currency}</td>
            </tr>
          </tbody>
        </table>
        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td>${order.finalAmount.toFixed(2)} ${order.currency}</td>
            </tr>
            <tr>
              <td>Tax (0%):</td>
              <td>0.00 ${order.currency}</td>
            </tr>
            <tr>
              <td class="total-amount">Total:</td>
              <td class="total-amount">${order.finalAmount.toFixed(2)} ${order.currency}</td>
            </tr>
          </table>
        </div>
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>If you have any questions, please contact us at ${company.email}.</p>
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

    // 1. Fetch invoice details
    const invoice: Invoice = await env.DB.prepare(
      'SELECT * FROM invoices WHERE id = ?'
    ).bind(invoiceId).first();

    if (!invoice) {
      return new Response('Invoice not found', { status: 404 });
    }

    // 2. Fetch associated order details
    const order: Order = await env.DB.prepare(
      'SELECT * FROM orders WHERE id = ?'
    ).bind(invoice.orderId).first();

    if (!order) {
      return new Response('Associated order not found', { status: 404 });
    }

    // 3. Fetch invoice settings (e.g., company details)
    const settingsStmt = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind('invoice_settings').first();
    const settings = settingsStmt ? JSON.parse(settingsStmt.value as string) : {};

    // 4. Generate HTML
    const html = generateInvoiceHTML(invoice, order, settings);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    return new Response(`Error generating invoice: ${error.message}`, { status: 500 });
  }
};
