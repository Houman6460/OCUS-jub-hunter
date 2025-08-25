import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Receipt } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: string;
  currency: string;
  status: string;
  pdf_url: string;
}

// Helper function to fetch data with authentication
const fetcher = async (url: string) => {
  const token = localStorage.getItem('session_token'); // Or however the token is stored
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export default function UserInvoicesPage() {
  const { t } = useLanguage();
  
  // Fetch user's invoices
  const { data: invoices, isLoading, error } = useQuery<Invoice[], Error>({
    queryKey: ['userInvoices'],
    queryFn: () => fetcher('/api/invoices'),
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
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>Error fetching invoices: {error.message}</p>
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
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="space-y-2 mb-4 sm:mb-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Invoice {invoice.invoice_number}
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Date:</span> {new Date(invoice.invoice_date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span> 
                          <span className="font-bold text-gray-900 ml-1">{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(parseFloat(invoice.total_amount))}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(invoice.pdf_url, '_blank')}
                        className="flex items-center gap-2"
                        disabled={!invoice.pdf_url}
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
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