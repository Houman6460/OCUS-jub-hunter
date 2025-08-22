import jsPDF from 'jspdf';

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  paidAt?: string;
  customerName: string;
  customerEmail: string;
  amount: number | string;
  currency: string;
  taxAmount?: string;
  paymentMethod?: string;
  productId: string;
  orderId?: number;
  status?: string;
}

export const generateInvoicePDF = async (invoiceData: InvoiceData): Promise<Blob> => {
  const pdf = new jsPDF();
  
  // Simple header with minimal styling
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(15, 45, 195, 45);
  
  // Smaller, simpler logo
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(1);
  pdf.circle(25, 25, 8, 'S');
  pdf.setFillColor(100, 100, 100);
  pdf.circle(25, 25, 2, 'F');
  
  // Company name - simpler styling
  pdf.setTextColor(50, 50, 50);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('OCUS JOB HUNTER', 40, 28);
  
  // Tagline - smaller and subtle
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 120, 120);
  pdf.text('Premium Job Automation Platform', 40, 35);
  
  // Invoice title - simple without background
  pdf.setTextColor(50, 50, 50);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', 150, 65);
  
  // Invoice details - simple text without boxes
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Invoice Number:', 140, 75);
  pdf.text('Invoice Date:', 140, 82);
  if (invoiceData.dueDate) {
    pdf.text('Due Date:', 140, 89);
  }
  
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(50, 50, 50);
  pdf.text(invoiceData.invoiceNumber, 140, 79);
  pdf.text(new Date(invoiceData.invoiceDate).toLocaleDateString(), 140, 86);
  if (invoiceData.dueDate) {
    pdf.text(new Date(invoiceData.dueDate).toLocaleDateString(), 140, 93);
  }
  
  // Company details - simple text without background
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text('FROM:', 20, 60);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(50, 50, 50);
  pdf.text('OCUS Job Hunter', 20, 70);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Premium Extension Services', 20, 77);
  pdf.text('Email: info@logoland.se', 20, 84);
  
  // Customer details - simple text without boxes
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text('BILL TO:', 20, 100);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(50, 50, 50);
  pdf.text(invoiceData.customerName, 20, 110);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(invoiceData.customerEmail, 20, 117);
  
  // Payment status - simple text
  if (invoiceData.status === 'paid' && invoiceData.paidAt) {
    pdf.setTextColor(40, 167, 69);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('✓ PAID', 140, 105);
    
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(`Paid: ${new Date(invoiceData.paidAt).toLocaleDateString()}`, 140, 112);
  }
  
  // Items table - simple design
  const tableTop = 130;
  
  // Simple line separator
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(15, tableTop, 195, tableTop);
  
  // Table header - simple text
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('DESCRIPTION', 20, tableTop + 10);
  pdf.text('AMOUNT', 170, tableTop + 10);
  
  // Item details - simplified
  const itemY = tableTop + 20;
  pdf.setTextColor(50, 50, 50);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('OCUS Job Hunter Premium Extension', 20, itemY);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Order ID: ${invoiceData.orderId}`, 20, itemY + 8);
  
  // Convert amount to number for calculations
  const amount = typeof invoiceData.amount === 'string' 
    ? parseFloat(invoiceData.amount) 
    : invoiceData.amount;
    
  // Ensure required fields have defaults
  const paymentMethod = invoiceData.paymentMethod || 'Credit Card';
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(50, 50, 50);
  pdf.text(`${invoiceData.currency.toUpperCase()} ${amount.toFixed(2)}`, 170, itemY);
  
  // Totals section - simple design
  const totalsY = tableTop + 40;
  
  // Simple line separator
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(120, totalsY, 195, totalsY);
  
  // Total - simple text
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(50, 50, 50);
  pdf.text('TOTAL:', 125, totalsY + 15);
  pdf.text(`${invoiceData.currency.toUpperCase()} ${amount.toFixed(2)}`, 170, totalsY + 15);
  
  // Payment information - simple text
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Payment Method:', 20, totalsY + 30);
  pdf.setFont('helvetica', 'bold');
  pdf.text(paymentMethod.toUpperCase(), 20, totalsY + 37);
  
  // Simple footer
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(15, 240, 195, 240);
  
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Thank you for choosing OCUS Job Hunter!', 20, 250);
  pdf.text('Questions? Contact: info@logoland.se', 20, 257);
  
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
