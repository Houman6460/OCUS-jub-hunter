// functions/lib/pdfGenerator.ts

// Basic HTML template for the invoice. This can be styled with inline CSS.
function getInvoiceHTML(invoiceData: any, settings: any): string {
  const { invoice, items, customer } = invoiceData;
  const companyName = settings?.companyName || 'OCUS Job Hunter';
  const primaryColor = settings?.primaryColor || '#007bff';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Invoice #${invoice.invoice_number}</title>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; }
            .invoice-box table { width: 100%; line-height: inherit; text-align: left; }
            .invoice-box table td { padding: 5px; vertical-align: top; }
            .invoice-box table tr td:nth-child(2) { text-align: right; }
            .invoice-box table tr.top table td { padding-bottom: 20px; }
            .invoice-box table tr.top table td.title { font-size: 45px; line-height: 45px; color: #333; }
            .invoice-box table tr.information table td { padding-bottom: 40px; }
            .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
            .invoice-box table tr.details td { padding-bottom: 20px; }
            .invoice-box table tr.item td{ border-bottom: 1px solid #eee; }
            .invoice-box table tr.item.last td { border-bottom: none; }
            .invoice-box table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
            h1 { color: ${primaryColor}; }
        </style>
    </head>
    <body>
        <div class="invoice-box">
            <h1>Invoice #${invoice.invoice_number}</h1>
            <p>
                Billed To: ${customer.name}<br>
                ${customer.email}
            </p>
            <p>
                Date: ${new Date(invoice.invoice_date).toLocaleDateString()}<br>
                Status: ${invoice.status}
            </p>
            <table>
                <tr class="heading">
                    <td>Item</td>
                    <td>Price</td>
                </tr>
                ${items.map((item: any) => `
                <tr class="item">
                    <td>${item.product_name} (x${item.quantity})</td>
                    <td>$${item.total_price}</td>
                </tr>
                `).join('')}
                <tr class="total">
                    <td></td>
                    <td>Total: $${invoice.amount}</td>
                </tr>
            </table>
        </div>
    </body>
    </html>
  `;
}

// This function will now be responsible for generating the PDF.
// For a true serverless environment, we would use a service or a WASM-based library.
// As a placeholder, this function returns the HTML content, which we'll adapt.
export async function generateInvoicePDF(invoiceData: any, settings: any): Promise<string> {
  // In a real scenario, this function would convert HTML to a PDF buffer.
  // Since we can't use puppeteer, we'll return the HTML and handle it.
  const html = getInvoiceHTML(invoiceData, settings);
  return html; // Returning HTML to be used by a potential API endpoint.
}
