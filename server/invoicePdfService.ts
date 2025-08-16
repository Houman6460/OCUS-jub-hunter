import puppeteer from 'puppeteer';
import type { Invoice, InvoiceItem, InvoiceSettings } from '@shared/schema';

export async function generateInvoicePDF(
  invoice: Invoice & { items: InvoiceItem[] }, 
  settings?: InvoiceSettings
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    const html = generateInvoiceHTML(invoice, settings);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

function generateInvoiceHTML(
  invoice: Invoice & { items: InvoiceItem[] }, 
  settings?: InvoiceSettings
): string {
  const companyName = settings?.companyName || 'OCUS Job Hunter';
  const primaryColor = settings?.primaryColor || '#007bff';
  const secondaryColor = settings?.secondaryColor || '#6c757d';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 3px solid ${primaryColor};
          padding-bottom: 20px;
        }
        
        .company-info h1 {
          color: ${primaryColor};
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .company-info p {
          color: ${secondaryColor};
          margin-bottom: 5px;
        }
        
        .invoice-details {
          text-align: right;
        }
        
        .invoice-title {
          font-size: 32px;
          color: ${primaryColor};
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .invoice-number {
          font-size: 18px;
          color: ${secondaryColor};
          margin-bottom: 5px;
        }
        
        .billing-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        
        .billing-info h3 {
          color: ${primaryColor};
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .billing-info p {
          margin-bottom: 5px;
          color: #555;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .items-table thead {
          background-color: ${primaryColor};
          color: white;
        }
        
        .items-table th,
        .items-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        .items-table th {
          font-weight: bold;
        }
        
        .items-table tbody tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .text-right {
          text-align: right;
        }
        
        .totals {
          margin-left: auto;
          width: 300px;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        
        .totals-row.total {
          font-weight: bold;
          font-size: 18px;
          border-bottom: 3px solid ${primaryColor};
          color: ${primaryColor};
        }
        
        .payment-info {
          margin-top: 40px;
          padding: 20px;
          background-color: #f8f9fa;
          border-left: 4px solid ${primaryColor};
        }
        
        .payment-info h3 {
          color: ${primaryColor};
          margin-bottom: 10px;
        }
        
        .notes {
          margin-top: 30px;
          padding: 15px;
          background-color: #f1f3f4;
          border-radius: 5px;
        }
        
        .notes h4 {
          color: ${primaryColor};
          margin-bottom: 10px;
        }
        
        .footer {
          margin-top: 50px;
          text-align: center;
          color: ${secondaryColor};
          font-size: 14px;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .status-issued {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .status-paid {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-overdue {
          background-color: #f8d7da;
          color: #721c24;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-info">
            <h1>${companyName}</h1>
            ${settings?.companyAddress ? `<p>${settings.companyAddress.replace(/\n/g, '<br>')}</p>` : ''}
            ${settings?.companyPhone ? `<p>Phone: ${settings.companyPhone}</p>` : ''}
            ${settings?.companyEmail ? `<p>Email: ${settings.companyEmail}</p>` : ''}
            ${settings?.companyWebsite ? `<p>Website: ${settings.companyWebsite}</p>` : ''}
          </div>
          <div class="invoice-details">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">#${invoice.invoiceNumber}</div>
            <div class="status-badge status-${invoice.status}">${invoice.status}</div>
          </div>
        </div>
        
        <div class="billing-section">
          <div class="billing-info">
            <h3>Bill To:</h3>
            <p><strong>${invoice.customerName}</strong></p>
            <p>${invoice.customerEmail}</p>
            ${invoice.billingAddress ? `<p>${invoice.billingAddress.replace(/\n/g, '<br>')}</p>` : ''}
          </div>
          <div class="billing-info">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p><strong>Currency:</strong> ${invoice.currency.toUpperCase()}</p>
            ${invoice.paidAt ? `<p><strong>Paid Date:</strong> ${new Date(invoice.paidAt).toLocaleDateString()}</p>` : ''}
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>
                  <strong>${item.productName}</strong>
                  ${item.description ? `<br><small style="color: #666;">${item.description}</small>` : ''}
                </td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${invoice.currency.toUpperCase()} ${parseFloat(item.unitPrice).toFixed(2)}</td>
                <td class="text-right">${invoice.currency.toUpperCase()} ${parseFloat(item.totalPrice).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>${invoice.currency.toUpperCase()} ${parseFloat(invoice.subtotal).toFixed(2)}</span>
          </div>
          ${parseFloat(invoice.taxAmount || '0') > 0 ? `
            <div class="totals-row">
              <span>Tax:</span>
              <span>${invoice.currency.toUpperCase()} ${parseFloat(invoice.taxAmount || '0').toFixed(2)}</span>
            </div>
          ` : ''}
          ${parseFloat(invoice.discountAmount || '0') > 0 ? `
            <div class="totals-row">
              <span>Discount:</span>
              <span>-${invoice.currency.toUpperCase()} ${parseFloat(invoice.discountAmount || '0').toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="totals-row total">
            <span>Total:</span>
            <span>${invoice.currency.toUpperCase()} ${parseFloat(invoice.totalAmount).toFixed(2)}</span>
          </div>
        </div>
        
        ${invoice.status === 'issued' ? `
          <div class="payment-info">
            <h3>Payment Information</h3>
            <p>Please remit payment within 30 days of the invoice date.</p>
            <p>Thank you for your business!</p>
          </div>
        ` : ''}
        
        ${invoice.notes ? `
          <div class="notes">
            <h4>Notes</h4>
            <p>${invoice.notes.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          ${settings?.footerText || 'Thank you for your business!'}
          ${settings?.termsAndConditions ? `<br><br><small>${settings.termsAndConditions}</small>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}