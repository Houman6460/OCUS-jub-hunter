import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, X, Calendar, CreditCard, DollarSign, User, Mail, Package } from 'lucide-react';
import { downloadInvoicePDF } from '@/lib/invoiceGenerator';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: number;
  invoice_number: string;
  order_id: number;
  amount: string;
  currency: string;
  tax_amount: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  invoice_date: string;
  due_date?: string;
  paid_at?: string;
  created_at: string;
  product_id?: string;
  payment_method?: string;
  customer_name?: string;
  customer_email?: string;
}

interface InvoicePreviewProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoicePreview({ invoice, isOpen, onClose }: InvoicePreviewProps) {
  const { toast } = useToast();

  if (!invoice) return null;

  const handleDownloadPDF = async () => {
    try {
      const success = await downloadInvoicePDF({
        invoiceNumber: invoice.invoice_number,
        invoiceDate: invoice.invoice_date,
        dueDate: invoice.due_date,
        paidAt: invoice.paid_at,
        customerName: invoice.customer_name || 'Customer',
        customerEmail: invoice.customer_email || 'customer@example.com',
        amount: invoice.amount,
        currency: invoice.currency,
        taxAmount: invoice.tax_amount,
        paymentMethod: invoice.payment_method || 'Stripe',
        productId: invoice.product_id || 'premium-extension',
        orderId: invoice.order_id,
        status: invoice.status
      });
      
      if (success) {
        toast({
          title: "Download Started",
          description: `Invoice ${invoice.invoice_number} has been downloaded successfully.`,
        });
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('Invoice download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate invoice PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✓ Paid</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">📧 Sent</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">📝 Draft</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">✗ Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Invoice Preview</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Invoice Preview */}
        <div className="bg-white border rounded-lg p-8 shadow-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg -mx-8 -mt-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Logo */}
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-white rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">OCUS JOB HUNTER</h1>
                  <p className="text-blue-100 text-sm">Premium Job Automation Platform</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  <h2 className="text-2xl font-bold">INVOICE</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Company Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-600 mb-2">FROM:</h3>
              <div className="space-y-1">
                <p className="font-semibold">OCUS Job Hunter</p>
                <p className="text-sm text-gray-600">Premium Extension Services</p>
                <p className="text-sm text-gray-600">support@ocus-jobhunter.com</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border border-blue-200 p-4 rounded-lg">
              <h3 className="font-bold text-blue-600 mb-2">BILL TO:</h3>
              <div className="space-y-1">
                <p className="font-semibold">{invoice.customer_name}</p>
                <p className="text-sm text-gray-600">{invoice.customer_email}</p>
              </div>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Invoice Number</p>
                <p className="font-semibold">{invoice.invoice_number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Invoice Date</p>
                <p className="font-semibold">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                {getStatusBadge(invoice.status)}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg overflow-hidden mb-8">
            <div className="bg-blue-600 text-white p-4">
              <div className="grid grid-cols-2">
                <h4 className="font-semibold">DESCRIPTION</h4>
                <h4 className="font-semibold text-right">AMOUNT</h4>
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="grid grid-cols-2 items-start">
                <div>
                  <h5 className="font-semibold mb-2">OCUS Job Hunter Premium Extension</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Premium automation features</li>
                    <li>• Unlimited job applications</li>
                    <li>• Advanced filtering and targeting</li>
                    <li>• Order ID: {invoice.order_id}</li>
                  </ul>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">
                    {invoice.currency.toUpperCase()} {parseFloat(invoice.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              {invoice.tax_amount && parseFloat(invoice.tax_amount) > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{invoice.currency.toUpperCase()} {(parseFloat(invoice.amount) - parseFloat(invoice.tax_amount)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{invoice.currency.toUpperCase()} {parseFloat(invoice.tax_amount).toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold text-blue-600">
                  <span>TOTAL:</span>
                  <span>{invoice.currency.toUpperCase()} {parseFloat(invoice.amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-6 p-4 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">Payment Method:</span>
              <span className="uppercase">{invoice.payment_method || 'Stripe'}</span>
            </div>
            {invoice.status === 'paid' && invoice.paid_at && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">
                  Paid on {new Date(invoice.paid_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 bg-blue-600 text-white p-4 rounded-lg -mx-8 -mb-8">
            <div className="text-center">
              <p className="font-semibold mb-1">Thank you for choosing OCUS Job Hunter!</p>
              <p className="text-sm text-blue-100">
                Questions? Contact our support team at support@ocus-jobhunter.com
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
          <Button onClick={handleDownloadPDF} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
