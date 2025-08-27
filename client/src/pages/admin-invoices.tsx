import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Eye, Palette, Settings, Upload, X, Loader2, ReceiptText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import "@/styles/invoice-preview.css";

interface InvoiceSettings {
  id: number;
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  taxNumber?: string;
  invoicePrefix: string;
  receiptPrefix: string;
  invoiceNotes?: string;
  termsAndConditions?: string;
  footerText?: string;
  primaryColor: string;
  secondaryColor: string;
}

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

export default function AdminInvoicesPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Fetch invoice settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/invoices/admin/settings'],
    refetchInterval: false
  });

  // Fetch invoices list
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['/api/invoices/admin/list'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
            <p className="text-gray-600">Manage invoices, receipts, and billing settings</p>
          </div>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Design & Settings</TabsTrigger>
            <TabsTrigger value="invoices">Invoice List</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Invoice Design Settings */}
          <TabsContent value="settings" className="space-y-6">
            <InvoiceSettingsCard settings={settings} isLoading={settingsLoading} />
          </TabsContent>

          {/* Invoice List */}
          <TabsContent value="invoices" className="space-y-6">
            <InvoiceListCard invoices={invoices} isLoading={invoicesLoading} />
          </TabsContent>

          {/* Preview */}
          <TabsContent value="preview" className="space-y-6">
            <InvoicePreviewCard settings={settings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function InvoiceSettingsCard({ settings, isLoading }: { settings: InvoiceSettings; isLoading: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [companyName, setCompanyName] = useState('OCUS Job Hunter');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [receiptPrefix, setReceiptPrefix] = useState('RCP');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [footerText, setFooterText] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#007bff');
  const [secondaryColor, setSecondaryColor] = useState('#6c757d');

  // Update form values when settings load
  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || 'OCUS Job Hunter');
      setCompanyLogo(settings.companyLogo || '');
      setCompanyAddress(settings.companyAddress || '');
      setCompanyPhone(settings.companyPhone || '');
      setCompanyEmail(settings.companyEmail || '');
      setCompanyWebsite(settings.companyWebsite || '');
      setTaxNumber(settings.taxNumber || '');
      setInvoicePrefix(settings.invoicePrefix || 'INV');
      setReceiptPrefix(settings.receiptPrefix || 'RCP');
      setInvoiceNotes(settings.invoiceNotes || '');
      setTermsAndConditions(settings.termsAndConditions || '');
      setFooterText(settings.footerText || '');
      setPrimaryColor(settings.primaryColor || '#007bff');
      setSecondaryColor(settings.secondaryColor || '#6c757d');
    }
  }, [settings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<InvoiceSettings>) => {
      const response = await fetch('/api/invoices/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices/admin/settings'] });
      toast({
        title: "Success",
        description: "Invoice settings updated successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update invoice settings",
        variant: "destructive"
      });
    }
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      companyName,
      companyLogo,
      companyAddress,
      companyPhone,
      companyEmail,
      companyWebsite,
      taxNumber,
      invoicePrefix,
      receiptPrefix,
      invoiceNotes,
      termsAndConditions,
      footerText,
      primaryColor,
      secondaryColor
    });
  };

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setCompanyLogo(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>
            Configure your company details for invoices and receipts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="logo">Company Logo</Label>
            <div className="space-y-2">
              {companyLogo && (
                <div className="relative inline-block">
                  <img 
                    src={companyLogo} 
                    alt="Company Logo" 
                    className="h-16 w-auto border rounded"
                  />
                  <button
                    onClick={() => setCompanyLogo('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    title="Remove company logo"
                    aria-label="Remove company logo"
                  >
                    <X className="w-3 h-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="logo"
                  title="Upload company logo"
                  aria-label="Upload company logo file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="companyAddress">Address</Label>
            <Textarea
              id="companyAddress"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="123 Business St.&#10;City, State 12345&#10;Country"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyPhone">Phone</Label>
              <Input
                id="companyPhone"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="companyEmail">Email</Label>
              <Input
                id="companyEmail"
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="billing@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyWebsite">Website</Label>
              <Input
                id="companyWebsite"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="https://company.com"
              />
            </div>

            <div>
              <Label htmlFor="taxNumber">Tax ID / VAT Number</Label>
              <Input
                id="taxNumber"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="123-456-789"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design & Formatting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Design & Formatting
          </CardTitle>
          <CardDescription>
            Customize the appearance and formatting of invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
              <Input
                id="invoicePrefix"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="INV"
              />
            </div>

            <div>
              <Label htmlFor="receiptPrefix">Receipt Prefix</Label>
              <Input
                id="receiptPrefix"
                value={receiptPrefix}
                onChange={(e) => setReceiptPrefix(e.target.value)}
                placeholder="RCP"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#007bff"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-20"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#6c757d"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="invoiceNotes">Default Invoice Notes</Label>
            <Textarea
              id="invoiceNotes"
              value={invoiceNotes}
              onChange={(e) => setInvoiceNotes(e.target.value)}
              placeholder="Payment is due within 30 days of invoice date."
            />
          </div>

          <div>
            <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
            <Textarea
              id="termsAndConditions"
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              placeholder="All sales are final. No refunds after 30 days..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="footerText">Footer Text</Label>
            <Textarea
              id="footerText"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Thank you for your business!"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="lg:col-span-2">
        <Button 
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          className="w-full md:w-auto"
        >
          {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}

function InvoiceListCard({ invoices, isLoading }: { invoices: Invoice[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-300 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Management</CardTitle>
        <CardDescription>
          View and manage all generated invoices and receipts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!invoices || invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto h-12 w-12 mb-4" />
            <p>No invoices found</p>
            <p className="text-sm">Invoices will appear here after orders are placed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Invoice #</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono">{invoice.invoiceNumber}</td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{invoice.customerName}</div>
                        <div className="text-sm text-gray-500">{invoice.customerEmail}</div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold">${invoice.totalAmount}</td>
                    <td className="p-3">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/api/invoices/${invoice.id}/html`, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/api/invoices/${invoice.id}/download`, '_blank')}
                          title="Download Invoice"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/api/invoices/${invoice.id}/receipt`, '_blank')}
                          title="View Receipt"
                        >
                          <ReceiptText className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/api/invoices/${invoice.id}/download-receipt`, '_blank')}
                          title="Download Receipt"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InvoicePreviewCard({ settings }: { settings: InvoiceSettings }) {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current && settings) {
      previewRef.current.style.setProperty('--primary-color', settings.primaryColor);
      previewRef.current.style.setProperty('--secondary-color', settings.secondaryColor);
    }
  }, [settings]);

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading preview...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Preview</CardTitle>
        <CardDescription>
          Preview how your invoices will look with current settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          ref={previewRef}
          className="border rounded-lg p-6 bg-white invoice-preview"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-4 invoice-header">
            <div>
              {settings.companyLogo && (
                <img src={settings.companyLogo} alt={settings.companyName} className="max-h-12 mb-3" />
              )}
              <h1 className="text-xl font-bold invoice-company-name">
                {settings.companyName}
              </h1>
              {settings.companyAddress && (
                <div className="text-sm invoice-company-address">
                  {settings.companyAddress.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold invoice-title">
                INVOICE
              </h2>
              <p className="font-mono">{settings.invoicePrefix}-2025-0001</p>
            </div>
          </div>

          {/* Sample Invoice Content */}
          <div className="grid grid-cols-2 gap-8 mb-6 p-4 bg-gray-50 rounded">
            <div>
              <h3 className="font-semibold mb-2 invoice-section-title">Bill To:</h3>
              <p><strong>John Doe</strong></p>
              <p>john.doe@example.com</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 invoice-section-title">Invoice Details:</h3>
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Due:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Sample Items */}
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="invoice-table-header">
                <th className="text-left p-3">Description</th>
                <th className="text-center p-3">Qty</th>
                <th className="text-right p-3">Price</th>
                <th className="text-right p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">
                  <strong>OCUS Job Hunter Chrome Extension</strong>
                  <br />
                  <small className="invoice-item-description">Premium photography job hunting tool</small>
                </td>
                <td className="text-center p-3">1</td>
                <td className="text-right p-3">$29.99</td>
                <td className="text-right p-3">$29.99</td>
              </tr>
            </tbody>
          </table>

          {/* Total */}
          <div className="w-48 ml-auto">
            <div className="p-3 text-right font-bold text-white invoice-total">
              TOTAL: $29.99
            </div>
          </div>

          {/* Footer */}
          {settings.footerText && (
            <div className="mt-6 pt-4 border-t text-center text-sm invoice-footer">
              {settings.footerText}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview Full Invoice
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}