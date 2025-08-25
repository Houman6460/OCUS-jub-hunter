// functions/lib/invoiceToPdf.ts
import PDFDocument from 'pdfkit';

function generateHeader(doc: PDFKit.PDFDocument, invoice: any) {
  doc
    .image('client/public/ocus_logo_job_hunter_v2_192.png', 50, 45, { width: 50 })
    .fillColor('#444444')
    .fontSize(20)
    .text('OCUS Job Hunter', 110, 57)
    .fontSize(10)
    .text(`Invoice #: ${invoice.invoice_number}`, 200, 65, { align: 'right' })
    .text(`Invoice Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, 200, 80, { align: 'right' })
    .moveDown();
}

function generateCustomerInformation(doc: PDFKit.PDFDocument, invoice: any, customer: any) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('Invoice', 50, 160);

  generateHr(doc, 185);

  doc
    .fontSize(10)
    .text('Billed To:', 50, 200)
    .font('Helvetica-Bold')
    .text(customer.name, 50, 215)
    .font('Helvetica')
    .text(customer.email, 50, 230)
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc: PDFKit.PDFDocument, invoice: any, items: any[]) {
  let i;
  const invoiceTableTop = 330;

  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Item',
    'Description',
    'Unit Cost',
    'Quantity',
    'Line Total'
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font('Helvetica');

  for (i = 0; i < items.length; i++) {
    const item = items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.product_name,
      item.description || '',
      `$${item.unit_price}`,
      item.quantity,
      `$${item.total_price}`
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    '',
    '',
    'Subtotal',
    '',
    `$${invoice.amount}`
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    '',
    '',
    'Total Paid',
    '',
    `$${invoice.amount}`
  );
}

function generateFooter(doc: PDFKit.PDFDocument) {
  doc
    .fontSize(10)
    .text(
      'Thank you for your business.',
      50,
      780,
      { align: 'center', width: 500 }
    );
}

function generateTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  item: string,
  description: string,
  unitCost: string,
  quantity: string,
  lineTotal: string
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: 'right' })
    .text(quantity, 370, y, { width: 90, align: 'right' })
    .text(lineTotal, 0, y, { align: 'right' });
}

function generateHr(doc: PDFKit.PDFDocument, y: number) {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

export function createInvoicePdf(invoiceData: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: any[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', (err) => {
      reject(err);
    });

    const { invoice, items, customer } = invoiceData;

    generateHeader(doc, invoice);
    generateCustomerInformation(doc, invoice, customer);
    generateInvoiceTable(doc, invoice, items);
    generateFooter(doc);

    doc.end();
  });
}
