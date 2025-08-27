import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../../lib/context';

// Data structures
interface Invoice {
  id: number;
  orderId: number;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  invoiceDate: string;
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
}

// Function to generate receipt HTML
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Receipt for Invoice #${invoice.invoiceNumber}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; padding: 30px; background-color: #fff; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #eee; }
        .header h1 { font-size: 2.2em; color: #28a745; margin: 0; }
        .header p { font-size: 1.1em; color: #555; }
        .details { margin-top: 30px; font-size: 0.95em; }
        .details strong { color: #000; }
        .summary { margin-top: 30px; }
        .summary h3 { font-size: 1.2em; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        td { padding: 10px 0; }
        .total-amount { font-size: 1.5em; font-weight: bold; color: #000; }
        .footer { margin-top: 30px; text-align: center; font-size: 0.85em; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Receipt</h1>
          <p>Thank you for your purchase!</p>
        </div>
        <div class="details">
          <p><strong>Receipt #:</strong> RCPT-${invoice.id}</p>
          <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Payment Date:</strong> ${new Date(order.completedAt).toLocaleDateString()}</p>
          <p><strong>Paid To:</strong> ${company.name}</p>
          <p><strong>Paid By:</strong> ${order.customerName} (${order.customerEmail})</p>
        </div>
        <div class="summary">
          <h3>Payment Summary</h3>
          <table>
            <tr>
              <td>${order.productName}</td>
              <td style="text-align: right;">${order.finalAmount.toFixed(2)} ${order.currency}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Total Paid:</td>
              <td style="text-align: right;" class="total-amount">${order.finalAmount.toFixed(2)} ${order.currency}</td>
            </tr>
          </table>
        </div>
        <div class="footer">
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

    // Fetch invoice and order details
    const invoice: Invoice = await env.DB.prepare('SELECT * FROM invoices WHERE id = ?').bind(invoiceId).first();
    if (!invoice) return new Response('Invoice not found', { status: 404 });

    const order: Order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(invoice.orderId).first();
    if (!order) return new Response('Associated order not found', { status: 404 });

    // Fetch settings
    const settingsStmt = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind('invoice_settings').first();
    const settings = settingsStmt ? JSON.parse(settingsStmt.value as string) : {};

    const html = generateReceiptHTML(invoice, order, settings);

    return new Response(html, {
      headers: { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error: any) {
    return new Response(`Error generating receipt: ${error.message}`, { status: 500 });
  }
};
