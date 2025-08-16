import { db } from "./db";
import { invoices, invoiceItems, invoiceSettings, orders, customers, type Invoice, type InvoiceSettings } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface InvoiceData {
  orderId: number;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  billingAddress?: string;
  items: Array<{
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
}

export interface InvoiceTemplate {
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  taxNumber?: string;
  primaryColor: string;
  secondaryColor: string;
  invoiceNotes?: string;
  termsAndConditions?: string;
  footerText?: string;
}

export class InvoiceService {
  
  // Generate unique invoice number
  async generateInvoiceNumber(): Promise<string> {
    const settings = await this.getInvoiceSettings();
    const prefix = settings.invoicePrefix || 'INV';
    const date = new Date().toISOString().slice(0, 7).replace('-', ''); // YYYY-MM format
    
    let counter = 1;
    let invoiceNumber: string;
    let isUnique = false;
    
    while (!isUnique) {
      const paddedCounter = counter.toString().padStart(4, '0');
      invoiceNumber = `${prefix}-${date}-${paddedCounter}`;
      
      const existing = await db
        .select()
        .from(invoices)
        .where(eq(invoices.invoiceNumber, invoiceNumber))
        .limit(1);
      
      isUnique = existing.length === 0;
      if (isUnique) return invoiceNumber;
      counter++;
    }
    
    throw new Error('Unable to generate unique invoice number');
  }

  // Get invoice settings
  async getInvoiceSettings(): Promise<InvoiceSettings> {
    const settings = await db
      .select()
      .from(invoiceSettings)
      .limit(1);

    if (settings.length === 0) {
      // Create default settings
      const defaultSettings = await db
        .insert(invoiceSettings)
        .values({})
        .returning();
      
      return defaultSettings[0];
    }

    return settings[0];
  }

  // Update invoice settings
  async updateInvoiceSettings(data: Partial<InvoiceSettings>): Promise<InvoiceSettings> {
    const existingSettings = await db
      .select()
      .from(invoiceSettings)
      .limit(1);

    let updatedSettings;

    if (existingSettings.length === 0) {
      // Create new settings
      updatedSettings = await db
        .insert(invoiceSettings)
        .values({
          ...data,
          updatedAt: new Date()
        })
        .returning();
    } else {
      // Update existing settings
      updatedSettings = await db
        .update(invoiceSettings)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(invoiceSettings.id, existingSettings[0].id))
        .returning();
    }

    return updatedSettings[0];
  }

  // Create invoice from order data
  async createInvoiceFromOrder(orderId: number): Promise<Invoice> {
    // Get order details
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (order.length === 0) {
      throw new Error('Order not found');
    }

    const orderData = order[0];
    const invoiceNumber = await this.generateInvoiceNumber();
    
    // Calculate due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoiceData: InvoiceData = {
      orderId: orderId,
      customerId: orderData.customerId,
      customerName: orderData.customerName || orderData.customerEmail,
      customerEmail: orderData.customerEmail,
      items: [{
        productName: 'OCUS Job Hunter Chrome Extension',
        description: 'Premium photography job hunting tool for delivery platforms',
        quantity: 1,
        unitPrice: parseFloat(orderData.finalAmount)
      }],
      subtotal: parseFloat(orderData.finalAmount),
      taxAmount: 0,
      discountAmount: parseFloat(orderData.originalAmount) - parseFloat(orderData.finalAmount),
      notes: `Order ID: ${orderId}`
    };

    return await this.createInvoice(invoiceData);
  }

  // Create invoice
  async createInvoice(data: InvoiceData): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber();
    
    // Calculate due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Calculate totals
    const subtotal = data.subtotal;
    const taxAmount = data.taxAmount || 0;
    const discountAmount = data.discountAmount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Create invoice
    const invoice = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        orderId: data.orderId,
        customerId: data.customerId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        billingAddress: data.billingAddress,
        dueDate,
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        status: 'issued',
        notes: data.notes
      })
      .returning();

    const invoiceId = invoice[0].id;

    // Create invoice items
    for (const item of data.items) {
      const totalPrice = item.quantity * item.unitPrice;
      
      await db
        .insert(invoiceItems)
        .values({
          invoiceId,
          productName: item.productName,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          totalPrice: totalPrice.toFixed(2)
        });
    }

    return invoice[0];
  }

  // Get invoice with items
  async getInvoiceWithItems(invoiceId: number) {
    const invoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (invoice.length === 0) {
      throw new Error('Invoice not found');
    }

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));

    return {
      ...invoice[0],
      items
    };
  }

  // Get invoice by number
  async getInvoiceByNumber(invoiceNumber: string) {
    const invoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceNumber, invoiceNumber))
      .limit(1);

    if (invoice.length === 0) {
      throw new Error('Invoice not found');
    }

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoice[0].id));

    return {
      ...invoice[0],
      items
    };
  }

  // Get customer invoices
  async getCustomerInvoices(customerId: number) {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.customerId, customerId))
      .orderBy(desc(invoices.createdAt));
  }

  // Mark invoice as paid
  async markInvoiceAsPaid(invoiceId: number): Promise<Invoice> {
    const updatedInvoice = await db
      .update(invoices)
      .set({
        status: 'paid',
        paidAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    return updatedInvoice[0];
  }

  // Generate HTML invoice template
  async generateInvoiceHTML(invoiceId: number): Promise<string> {
    const invoiceData = await this.getInvoiceWithItems(invoiceId);
    const settings = await this.getInvoiceSettings();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoiceData.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid ${settings.primaryColor};
        }
        .company-info h1 {
            font-size: 28px;
            color: ${settings.primaryColor};
            margin-bottom: 10px;
        }
        .company-info p {
            color: ${settings.secondaryColor};
            margin-bottom: 5px;
        }
        .invoice-info {
            text-align: right;
        }
        .invoice-info h2 {
            font-size: 32px;
            color: ${settings.primaryColor};
            margin-bottom: 10px;
        }
        .invoice-meta {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
        }
        .customer-info, .invoice-details {
            flex: 1;
        }
        .customer-info h3, .invoice-details h3 {
            color: ${settings.primaryColor};
            margin-bottom: 10px;
            font-size: 16px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background: ${settings.primaryColor};
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #e9ecef;
        }
        .items-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        .totals {
            width: 300px;
            margin-left: auto;
            margin-bottom: 30px;
        }
        .totals table {
            width: 100%;
            border-collapse: collapse;
        }
        .totals td {
            padding: 8px 15px;
            border-bottom: 1px solid #e9ecef;
        }
        .totals .total-row {
            background: ${settings.primaryColor};
            color: white;
            font-weight: 600;
            font-size: 16px;
        }
        .footer {
            border-top: 2px solid #e9ecef;
            padding-top: 20px;
            margin-top: 40px;
        }
        .footer p {
            color: ${settings.secondaryColor};
            font-size: 12px;
            margin-bottom: 5px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-issued {
            background: #ffc107;
            color: #856404;
        }
        .status-paid {
            background: #28a745;
            color: white;
        }
        .status-overdue {
            background: #dc3545;
            color: white;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            ${settings.companyLogo ? `<img src="${settings.companyLogo}" alt="${settings.companyName}" style="max-height: 60px; margin-bottom: 15px;">` : ''}
            <h1>${settings.companyName}</h1>
            ${settings.companyAddress ? `<p>${settings.companyAddress.replace(/\n/g, '<br>')}</p>` : ''}
            ${settings.companyPhone ? `<p>Phone: ${settings.companyPhone}</p>` : ''}
            ${settings.companyEmail ? `<p>Email: ${settings.companyEmail}</p>` : ''}
            ${settings.companyWebsite ? `<p>Website: ${settings.companyWebsite}</p>` : ''}
            ${settings.taxNumber ? `<p>Tax ID: ${settings.taxNumber}</p>` : ''}
        </div>
        <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>${invoiceData.invoiceNumber}</strong></p>
            <p><span class="status-badge status-${invoiceData.status}">${invoiceData.status}</span></p>
        </div>
    </div>

    <div class="invoice-meta">
        <div class="customer-info">
            <h3>Bill To:</h3>
            <p><strong>${invoiceData.customerName}</strong></p>
            <p>${invoiceData.customerEmail}</p>
            ${invoiceData.billingAddress ? `<p>${invoiceData.billingAddress.replace(/\n/g, '<br>')}</p>` : ''}
        </div>
        <div class="invoice-details">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice Date:</strong> ${new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString()}</p>
            ${invoiceData.orderId ? `<p><strong>Order ID:</strong> ${invoiceData.orderId}</p>` : ''}
            ${invoiceData.paidAt ? `<p><strong>Paid On:</strong> ${new Date(invoiceData.paidAt).toLocaleDateString()}</p>` : ''}
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            ${invoiceData.items.map((item: any) => `
                <tr>
                    <td>
                        <strong>${item.productName}</strong>
                        ${item.description ? `<br><small style="color: ${settings.secondaryColor};">${item.description}</small>` : ''}
                    </td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">$${parseFloat(item.unitPrice).toFixed(2)}</td>
                    <td style="text-align: right;">$${parseFloat(item.totalPrice).toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td><strong>Subtotal:</strong></td>
                <td style="text-align: right;">$${parseFloat(invoiceData.subtotal).toFixed(2)}</td>
            </tr>
            ${parseFloat(invoiceData.discountAmount) > 0 ? `
            <tr>
                <td><strong>Discount:</strong></td>
                <td style="text-align: right; color: #28a745;">-$${parseFloat(invoiceData.discountAmount).toFixed(2)}</td>
            </tr>
            ` : ''}
            ${parseFloat(invoiceData.taxAmount) > 0 ? `
            <tr>
                <td><strong>Tax:</strong></td>
                <td style="text-align: right;">$${parseFloat(invoiceData.taxAmount).toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
                <td><strong>TOTAL:</strong></td>
                <td style="text-align: right;"><strong>$${parseFloat(invoiceData.totalAmount).toFixed(2)}</strong></td>
            </tr>
        </table>
    </div>

    ${invoiceData.notes ? `
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="color: ${settings.primaryColor}; margin-bottom: 10px;">Notes:</h4>
        <p>${invoiceData.notes}</p>
    </div>
    ` : ''}

    ${settings.termsAndConditions ? `
    <div style="margin-bottom: 20px;">
        <h4 style="color: ${settings.primaryColor}; margin-bottom: 10px;">Terms & Conditions:</h4>
        <p style="font-size: 12px; color: ${settings.secondaryColor};">${settings.termsAndConditions}</p>
    </div>
    ` : ''}

    <div class="footer">
        ${settings.footerText ? `<p>${settings.footerText}</p>` : ''}
        <p>Invoice generated on ${new Date().toLocaleDateString()} | ${settings.companyName}</p>
        ${settings.companyEmail ? `<p>Questions? Contact us at ${settings.companyEmail}</p>` : ''}
    </div>
</body>
</html>
    `;

    return html;
  }

  // Generate receipt HTML (simplified version of invoice)
  async generateReceiptHTML(invoiceId: number): Promise<string> {
    const invoiceData = await this.getInvoiceWithItems(invoiceId);
    const settings = await this.getInvoiceSettings();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt ${invoiceData.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid ${settings.primaryColor};
        }
        .header h1 {
            font-size: 24px;
            color: ${settings.primaryColor};
            margin-bottom: 10px;
        }
        .header h2 {
            font-size: 20px;
            color: ${settings.secondaryColor};
            margin-bottom: 15px;
        }
        .receipt-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .receipt-info p {
            margin-bottom: 5px;
        }
        .items {
            margin-bottom: 20px;
        }
        .item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .item:last-child {
            border-bottom: none;
        }
        .total {
            background: ${settings.primaryColor};
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            color: ${settings.secondaryColor};
            font-size: 12px;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e9ecef;
        }
        @media print {
            body { margin: 0; padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="header">
        ${settings.companyLogo ? `<img src="${settings.companyLogo}" alt="${settings.companyName}" style="max-height: 50px; margin-bottom: 15px;">` : ''}
        <h1>${settings.companyName}</h1>
        <h2>RECEIPT</h2>
        <p><strong>${invoiceData.invoiceNumber}</strong></p>
    </div>

    <div class="receipt-info">
        <p><strong>Date:</strong> ${new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
        <p><strong>Customer:</strong> ${invoiceData.customerName}</p>
        <p><strong>Email:</strong> ${invoiceData.customerEmail}</p>
        ${invoiceData.orderId ? `<p><strong>Order ID:</strong> ${invoiceData.orderId}</p>` : ''}
        <p><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: 600;">PAID</span></p>
    </div>

    <div class="items">
        ${invoiceData.items.map((item: any) => `
            <div class="item">
                <div>
                    <strong>${item.productName}</strong>
                    ${item.description ? `<br><small style="color: ${settings.secondaryColor};">${item.description}</small>` : ''}
                    <br><small>Qty: ${item.quantity}</small>
                </div>
                <div style="text-align: right;">
                    <strong>$${parseFloat(item.totalPrice).toFixed(2)}</strong>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="total">
        TOTAL PAID: $${parseFloat(invoiceData.totalAmount).toFixed(2)}
    </div>

    <div class="footer">
        <p>Thank you for your purchase!</p>
        <p>Receipt generated on ${new Date().toLocaleDateString()}</p>
        ${settings.companyEmail ? `<p>Questions? Contact us at ${settings.companyEmail}</p>` : ''}
    </div>
</body>
</html>
    `;

    return html;
  }
}

export const invoiceService = new InvoiceService();