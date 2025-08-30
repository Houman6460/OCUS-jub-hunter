import type { PagesFunction } from '@cloudflare/workers-types';
import { Env } from '../../../lib/context';
import jsPDF from 'jspdf';

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

// PDF generation based on client-side generator, simplified for Workers
function generateInvoicePDFDoc(invoice: Invoice, order: Order, settings: any) {
  const company = settings.company || {
    name: 'OCUS Job Hunter',
    address: 'Digital Services Company',
    email: 'support@jobhunter.one',
    website: 'https://jobhunter.one'
  };

  const pdf = new jsPDF();

  // Header line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(15, 45, 195, 45);

  // Minimal logo mark
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(1);
  pdf.circle(25, 25, 8, 'S');
  pdf.setFillColor(100, 100, 100);
  pdf.circle(25, 25, 2, 'F');

  // Company name
  pdf.setTextColor(50, 50, 50);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(company.name.toUpperCase(), 40, 28);

  // Invoice title
  pdf.setTextColor(50, 50, 50);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', 150, 65);

  // Invoice details
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Invoice Number:', 140, 75);
  pdf.text('Invoice Date:', 140, 82);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(50, 50, 50);
  pdf.text(String(invoice.invoiceNumber), 140, 79);
  pdf.text(new Date(invoice.invoiceDate).toLocaleDateString(), 140, 86);

  // From
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text('FROM:', 20, 60);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(50, 50, 50);
  pdf.text(company.name, 20, 70);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  if (company.address) pdf.text(company.address, 20, 77);
  if (company.email) pdf.text(`Email: ${company.email}`, 20, 84);

  // Bill to
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text('BILL TO:', 20, 100);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(50, 50, 50);
  pdf.text(order.customerName || invoice.customerName, 20, 110);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(order.customerEmail || invoice.customerEmail, 20, 117);

  // Items header line
  const tableTop = 130;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(15, tableTop, 195, tableTop);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('DESCRIPTION', 20, tableTop + 10);
  pdf.text('AMOUNT', 170, tableTop + 10);

  // Item row
  const itemY = tableTop + 20;
  const amount = typeof order.finalAmount === 'number' ? order.finalAmount : parseFloat(String(order.finalAmount));
  pdf.setTextColor(50, 50, 50);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text(order.productName || 'OCUS Job Hunter Premium Extension', 20, itemY);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Order ID: ${order.id}`, 20, itemY + 8);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(50, 50, 50);
  pdf.text(`${(order.currency || 'USD').toUpperCase()} ${amount.toFixed(2)}`, 170, itemY, { align: 'right' });

  // Totals
  const totalsY = tableTop + 40;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(120, totalsY, 195, totalsY);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(50, 50, 50);
  pdf.text('TOTAL:', 125, totalsY + 15);
  pdf.text(`${(order.currency || 'USD').toUpperCase()} ${amount.toFixed(2)}`, 195, totalsY + 15, { align: 'right' });

  // Footer
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(15, 240, 195, 240);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Thank you for choosing OCUS Job Hunter!', 20, 250);
  if (company.email) pdf.text(`Questions? Contact: ${company.email}`, 20, 257);

  return pdf;
}

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  try {
    const invoiceId = params.id;

    if (!invoiceId) {
      return new Response('Invoice ID is required', { status: 400 });
    }

    // Fetch data
    const invoice = await env.DB.prepare('SELECT * FROM invoices WHERE id = ?').bind(invoiceId).first<Invoice>();
    if (!invoice) return new Response('Invoice not found', { status: 404 });

    const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(invoice.orderId).first<Order>();
    if (!order) return new Response('Associated order not found', { status: 404 });

    const settingsStmt = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind('invoice_settings').first();
    const settings = settingsStmt ? JSON.parse(settingsStmt.value as string) : {};

    // Generate PDF
    const pdf = generateInvoicePDFDoc(invoice, order, settings);
    const pdfBuffer = pdf.output('arraybuffer');

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    return new Response(`Error generating invoice: ${error.message}`, { status: 500 });
  }
};
