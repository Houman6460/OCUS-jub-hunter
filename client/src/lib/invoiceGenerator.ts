import jsPDF from 'jspdf';

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  paidAt?: string;
  customerName: string;
  customerEmail: string;
  amount: string;
  currency: string;
  taxAmount?: string;
  paymentMethod: string;
  productId: string;
  orderId: number;
  status: string;
}

export const generateInvoicePDF = async (invoiceData: InvoiceData): Promise<Blob> => {
  const pdf = new jsPDF();
  
  // Set up colors
  const primaryColor = '#4A90E2';
  const textColor = '#333333';
  const lightGray = '#F5F5F5';
  
  // Add logo and header
  pdf.setFillColor(primaryColor);
  pdf.rect(0, 0, 210, 40, 'F');
  
  // Add company logo (simplified version)
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(2);
  pdf.circle(25, 20, 8, 'S');
  pdf.circle(25, 20, 5, 'S');
  pdf.circle(25, 20, 2, 'F');
  
  // Company name
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('OCUS JOB HUNTER', 40, 25);
  
  // Invoice title
  pdf.setTextColor(textColor);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', 150, 60);
  
  // Invoice details
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Invoice #: ${invoiceData.invoiceNumber}`, 150, 75);
  pdf.text(`Date: ${new Date(invoiceData.invoiceDate).toLocaleDateString()}`, 150, 85);
  if (invoiceData.dueDate) {
    pdf.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, 150, 95);
  }
  
  // Company details
  pdf.setFontSize(10);
  pdf.text('OCUS Job Hunter', 20, 60);
  pdf.text('Premium Extension Services', 20, 70);
  pdf.text('support@ocus-jobhunter.com', 20, 80);
  pdf.text('www.ocus-jobhunter.com', 20, 90);
  
  // Customer details
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bill To:', 20, 110);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoiceData.customerName, 20, 125);
  pdf.text(invoiceData.customerEmail, 20, 135);
  
  // Payment status
  if (invoiceData.status === 'paid' && invoiceData.paidAt) {
    pdf.setFillColor(34, 197, 94); // Green
    pdf.rect(150, 110, 40, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PAID', 165, 120);
    pdf.setTextColor(textColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Paid: ${new Date(invoiceData.paidAt).toLocaleDateString()}`, 150, 135);
  }
  
  // Items table header
  const tableTop = 160;
  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, tableTop, 170, 15, 'F');
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Description', 25, tableTop + 10);
  pdf.text('Amount', 160, tableTop + 10);
  
  // Items
  pdf.setFont('helvetica', 'normal');
  const itemY = tableTop + 25;
  pdf.text('OCUS Job Hunter Premium Extension', 25, itemY);
  pdf.text('Premium automation features and unlimited usage', 25, itemY + 10);
  pdf.text(`Order ID: ${invoiceData.orderId}`, 25, itemY + 20);
  
  const amount = parseFloat(invoiceData.amount);
  pdf.text(`${invoiceData.currency.toUpperCase()} ${amount.toFixed(2)}`, 160, itemY);
  
  // Totals
  const totalsY = itemY + 40;
  pdf.line(20, totalsY, 190, totalsY);
  
  if (invoiceData.taxAmount && parseFloat(invoiceData.taxAmount) > 0) {
    pdf.text('Subtotal:', 130, totalsY + 15);
    pdf.text(`${invoiceData.currency.toUpperCase()} ${(amount - parseFloat(invoiceData.taxAmount)).toFixed(2)}`, 160, totalsY + 15);
    
    pdf.text('Tax:', 130, totalsY + 25);
    pdf.text(`${invoiceData.currency.toUpperCase()} ${parseFloat(invoiceData.taxAmount).toFixed(2)}`, 160, totalsY + 25);
  }
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Total:', 130, totalsY + 35);
  pdf.text(`${invoiceData.currency.toUpperCase()} ${amount.toFixed(2)}`, 160, totalsY + 35);
  
  // Payment method
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Payment Method: ${invoiceData.paymentMethod}`, 20, totalsY + 60);
  
  // Footer
  pdf.setFontSize(8);
  pdf.text('Thank you for your business!', 20, 270);
  pdf.text('For support, contact us at support@ocus-jobhunter.com', 20, 280);
  
  return new Promise((resolve) => {
    const pdfBlob = pdf.output('blob');
    resolve(pdfBlob);
  });
};

export const downloadInvoicePDF = async (invoiceData: InvoiceData) => {
  try {
    const pdfBlob = await generateInvoicePDF(invoiceData);
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
