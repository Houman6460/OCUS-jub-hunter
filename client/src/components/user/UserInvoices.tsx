import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Eye, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { downloadInvoicePDF } from '@/lib/invoiceGenerator';
import { InvoicePreview } from './InvoicePreview';

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


export function UserInvoices() {
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Get user invoices
  const { data: invoices, isLoading, error } = useQuery<Invoice[]>({ 
    queryKey: ['/api/me/invoices'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/me/invoices`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      return response.json();
    },
  });

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

  const handleDownloadInvoice = async (invoice: Invoice) => {
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
      console.error('Error generating PDF:', error instanceof Error ? error.message : error);
      toast({
        title: "Download Failed",
        description: "Failed to generate invoice PDF. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoices & Receipts
          </CardTitle>
          <CardDescription>
            Download and manage your purchase invoices and receipts for tax purposes and record keeping.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-gray-600">Loading invoices...</p>
            </div>
          ) : error ? (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Failed to load invoices. Please try again later.
              </AlertDescription>
            </Alert>
          ) : !invoices || !Array.isArray(invoices) || invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No invoices found.</p>
              <p className="text-sm text-gray-500 mt-1">Invoices will appear here after you make a purchase.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice: Invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Invoice #{invoice.invoice_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(invoice.status)}
                      <p className="text-lg font-bold text-primary mt-1">
                        {invoice.currency.toUpperCase()} {parseFloat(invoice.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="text-sm font-medium">€{parseFloat(invoice.amount).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Invoice Date</p>
                        <p className="text-sm font-medium">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Payment Method</p>
                        <p className="text-sm font-medium capitalize">{invoice.payment_method || 'Stripe'}</p>
                      </div>
                    </div>
                  </div>

                  {invoice.status === 'paid' && invoice.paid_at && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-sm text-green-800 font-medium">
                          Paid on {new Date(invoice.paid_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownloadInvoice(invoice)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setIsPreviewOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      View Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Important Tax Notes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• All invoices include applicable VAT/tax where required</li>
              <li>• Keep these receipts for your business expense records</li>
              <li>• Contact support if you need additional tax documentation</li>
              <li>• Business customers can request VAT invoices with company details</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Preview Modal */}
      <InvoicePreview
        invoice={selectedInvoice}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedInvoice(null);
        }}
      />
    </div>
  );
}
