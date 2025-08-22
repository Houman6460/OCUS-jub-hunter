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
  
  // Header background with gradient effect
  pdf.setFillColor(74, 144, 226); // Primary blue
  pdf.rect(0, 0, 210, 50, 'F');
  
  // Add subtle gradient effect
  pdf.setFillColor(45, 123, 201);
  pdf.rect(0, 40, 210, 10, 'F');
  
  // Company logo - enhanced circular design
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(3);
  // Outer circle
  pdf.circle(30, 25, 12, 'S');
  // Middle circle
  pdf.setLineWidth(2);
  pdf.circle(30, 25, 8, 'S');
  // Inner circle
  pdf.setLineWidth(1.5);
  pdf.circle(30, 25, 4, 'S');
  // Center dot
  pdf.setFillColor(255, 255, 255);
  pdf.circle(30, 25, 2, 'F');
  
  // Company name with better typography
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('OCUS', 50, 22);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'normal');
  pdf.text('JOB HUNTER', 50, 32);
  
  // Tagline
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Premium Job Automation Platform', 50, 40);
  
  // Invoice title with background
  pdf.setFillColor(248, 249, 250);
  pdf.roundedRect(140, 55, 50, 20, 3, 3, 'F');
  pdf.setTextColor(51, 51, 51);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', 150, 68);
  
  // Invoice details in a styled box
  pdf.setDrawColor(108, 117, 125);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(140, 80, 50, 35, 2, 2, 'S');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(108, 117, 125);
  pdf.text('Invoice Number:', 143, 88);
  pdf.text('Invoice Date:', 143, 98);
  if (invoiceData.dueDate) {
    pdf.text('Due Date:', 143, 108);
  }
  
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(51, 51, 51);
  pdf.text(invoiceData.invoiceNumber, 143, 93);
  pdf.text(new Date(invoiceData.invoiceDate).toLocaleDateString(), 143, 103);
  if (invoiceData.dueDate) {
    pdf.text(new Date(invoiceData.dueDate).toLocaleDateString(), 143, 113);
  }
  
  // Company details in styled section
  pdf.setFillColor(248, 249, 250);
  pdf.roundedRect(15, 55, 80, 35, 3, 3, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(74, 144, 226);
  pdf.text('FROM:', 20, 65);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(51, 51, 51);
  pdf.text('OCUS Job Hunter', 20, 75);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(108, 117, 125);
  pdf.text('Premium Extension Services', 20, 82);
  pdf.text('Email: support@ocus-jobhunter.com', 20, 87);
  
  // Customer details in styled section
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(74, 144, 226);
  pdf.setLineWidth(1);
  pdf.roundedRect(15, 100, 80, 35, 3, 3, 'FD');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(74, 144, 226);
  pdf.text('BILL TO:', 20, 110);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(51, 51, 51);
  pdf.text(invoiceData.customerName, 20, 120);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(108, 117, 125);
  pdf.text(invoiceData.customerEmail, 20, 127);
  
  // Payment status badge
  if (invoiceData.status === 'paid' && invoiceData.paidAt) {
    pdf.setFillColor(40, 167, 69);
    pdf.roundedRect(140, 120, 50, 15, 5, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('✓ PAID', 155, 130);
    
    pdf.setTextColor(108, 117, 125);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(`Paid: ${new Date(invoiceData.paidAt).toLocaleDateString()}`, 143, 140);
  }
  
  // Items table with enhanced styling
  const tableTop = 155;
  
  // Table header
  pdf.setFillColor(74, 144, 226);
  pdf.roundedRect(15, tableTop, 180, 12, 2, 2, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('DESCRIPTION', 20, tableTop + 8);
  pdf.text('AMOUNT', 170, tableTop + 8);
  
  // Table content
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(248, 249, 250);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(15, tableTop + 12, 180, 40, 2, 2, 'FD');
  
  pdf.setTextColor(51, 51, 51);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  const itemY = tableTop + 25;
  pdf.text('OCUS Job Hunter Premium Extension', 20, itemY);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(108, 117, 125);
  pdf.text('• Premium automation features', 20, itemY + 8);
  pdf.text('• Unlimited job applications', 20, itemY + 15);
  pdf.text('• Advanced filtering and targeting', 20, itemY + 22);
  pdf.text(`• Order ID: ${invoiceData.orderId}`, 20, itemY + 29);
  
  // Amount
  const amount = parseFloat(invoiceData.amount);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(51, 51, 51);
  pdf.text(`${invoiceData.currency.toUpperCase()} ${amount.toFixed(2)}`, 170, itemY + 10);
  
  // Totals section with styling
  const totalsY = tableTop + 65;
  
  // Totals background
  pdf.setFillColor(248, 249, 250);
  pdf.roundedRect(120, totalsY, 75, 45, 3, 3, 'F');
  
  pdf.setTextColor(51, 51, 51);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  
  if (invoiceData.taxAmount && parseFloat(invoiceData.taxAmount) > 0) {
    pdf.text('Subtotal:', 125, totalsY + 10);
    pdf.text(`${invoiceData.currency.toUpperCase()} ${(amount - parseFloat(invoiceData.taxAmount)).toFixed(2)}`, 170, totalsY + 10);
    
    pdf.text('Tax:', 125, totalsY + 20);
    pdf.text(`${invoiceData.currency.toUpperCase()} ${parseFloat(invoiceData.taxAmount).toFixed(2)}`, 170, totalsY + 20);
  }
  
  // Total with emphasis
  pdf.setDrawColor(74, 144, 226);
  pdf.setLineWidth(1);
  pdf.line(125, totalsY + 25, 190, totalsY + 25);
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(74, 144, 226);
  pdf.text('TOTAL:', 125, totalsY + 35);
  pdf.text(`${invoiceData.currency.toUpperCase()} ${amount.toFixed(2)}`, 170, totalsY + 35);
  
  // Payment information
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(74, 144, 226);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(15, totalsY + 50, 100, 20, 3, 3, 'FD');
  
  pdf.setTextColor(108, 117, 125);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('PAYMENT METHOD:', 20, totalsY + 58);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoiceData.paymentMethod.toUpperCase(), 20, totalsY + 65);
  
  // Footer with enhanced styling
  pdf.setFillColor(74, 144, 226);
  pdf.rect(0, 260, 210, 37, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Thank you for choosing OCUS Job Hunter!', 20, 275);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Questions? Contact our support team at support@ocus-jobhunter.com', 20, 285);
  pdf.text('Visit us at www.ocus-jobhunter.com for more premium features', 20, 292);
  
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
