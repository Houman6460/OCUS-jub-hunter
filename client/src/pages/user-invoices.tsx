import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Receipt } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Invoice {
  id: number;
  invoiceNumber: string;
  orderId?: number;
  customerName: string;
  customerEmail: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: string;
  status: string;
  createdAt: string;
}

export default function UserInvoicesPage() {
  const { t } = useLanguage();
  
  // For demo purposes, use a dummy customer ID
  const customerId = "demo-customer-123";

  // Fetch user's invoices
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['/api/invoices/customer', customerId],
    refetchInterval: 30000
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices & Receipts</h2>
          <p className="text-gray-600">Download your purchase invoices and receipts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Invoices
          </CardTitle>
          <CardDescription>
            Access all invoices and receipts for your purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : !invoices || invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoices Yet</h3>
              <p className="text-gray-500 mb-4">
                Your invoices and receipts will appear here after you make a purchase
              </p>
              <Button variant="outline">
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice: Invoice) => (
                <div key={invoice.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Invoice {invoice.invoiceNumber}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status === 'paid' ? 'Paid' : invoice.status === 'overdue' ? 'Overdue' : 'Issued'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Date:</span> {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span> 
                          <span className="font-bold text-gray-900 ml-1">${invoice.totalAmount}</span>
                        </div>
                        {invoice.orderId && (
                          <div>
                            <span className="font-medium">Order:</span> #{invoice.orderId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/api/invoices/${invoice.id}/html`, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Invoice
                      </Button>
                      
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/api/invoices/${invoice.id}/receipt`, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Receipt className="w-4 h-4" />
                        View Receipt
                      </Button>

                      <div className="relative">
                        <Button
                          size="sm"
                          onClick={() => {
                            // Show download menu
                            const menu = document.getElementById(`download-menu-${invoice.id}`);
                            if (menu) {
                              menu.classList.toggle('hidden');
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        
                        <div 
                          id={`download-menu-${invoice.id}`}
                          className="hidden absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                        >
                          <div className="py-1">
                            <button
                              onClick={() => {
                                window.open(`/api/invoices/${invoice.id}/download`, '_blank');
                                document.getElementById(`download-menu-${invoice.id}`)?.classList.add('hidden');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FileText className="w-4 h-4 inline mr-2" />
                              Download Invoice
                            </button>
                            <button
                              onClick={() => {
                                window.open(`/api/invoices/${invoice.id}/download-receipt`, '_blank');
                                document.getElementById(`download-menu-${invoice.id}`)?.classList.add('hidden');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Receipt className="w-4 h-4 inline mr-2" />
                              Download Receipt
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {invoice.status === 'paid' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <Receipt className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Payment received - Thank you for your purchase!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Invoice Questions</h4>
              <p className="text-sm text-gray-600">
                If you have questions about your invoice or need a copy sent to a different email address, contact our support team.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Tax Documentation</h4>
              <p className="text-sm text-gray-600">
                All invoices include necessary tax information for your records. Download the PDF version for your accounting needs.
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <Button variant="outline">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}