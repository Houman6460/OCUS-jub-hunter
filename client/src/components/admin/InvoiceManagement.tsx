import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Plus, User, Calendar, DollarSign, Edit, Eye } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: string;
  totalAmount: string;
  currency: string;
  status: string;
  paidAt?: string;
  notes?: string;
}

interface InvoiceSettings {
  id?: number;
  companyName: string;
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

export function InvoiceManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // Fetch all invoices
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });

  // Fetch invoice settings
  const { data: settings, isLoading: loadingSettings } = useQuery<InvoiceSettings>({
    queryKey: ['/api/invoice-settings'],
  });

  // Update invoice settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<InvoiceSettings>) => {
      return await apiRequest('PUT', '/api/invoice-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoice-settings'] });
      toast({ title: "Settings updated successfully" });
      setShowSettingsDialog(false);
    },
    onError: (error: any) => {
      toast({ title: "Error updating settings", description: error.message, variant: "destructive" });
    }
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/invoices', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({ title: "Invoice created successfully" });
      setShowCreateDialog(false);
    },
    onError: (error: any) => {
      toast({ title: "Error creating invoice", description: error.message, variant: "destructive" });
    }
  });

  const downloadPDF = async (invoiceId: number, invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({ title: "Error downloading PDF", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'issued':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateInvoice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const invoiceData = {
      customerId: formData.get('customerId'),
      customerName: formData.get('customerName'),
      customerEmail: formData.get('customerEmail'),
      notes: formData.get('notes'),
      items: [{
        productName: formData.get('productName'),
        description: formData.get('productDescription'),
        quantity: parseInt(formData.get('quantity') as string),
        unitPrice: parseFloat(formData.get('unitPrice') as string)
      }]
    };

    createInvoiceMutation.mutate(invoiceData);
  };

  const handleUpdateSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const settingsData: Partial<InvoiceSettings> = {
      companyName: formData.get('companyName') as string,
      companyAddress: formData.get('companyAddress') as string,
      companyPhone: formData.get('companyPhone') as string,
      companyEmail: formData.get('companyEmail') as string,
      companyWebsite: formData.get('companyWebsite') as string,
      taxNumber: formData.get('taxNumber') as string,
      invoicePrefix: formData.get('invoicePrefix') as string,
      receiptPrefix: formData.get('receiptPrefix') as string,
      invoiceNotes: formData.get('invoiceNotes') as string,
      termsAndConditions: formData.get('termsAndConditions') as string,
      footerText: formData.get('footerText') as string,
      primaryColor: formData.get('primaryColor') as string,
      secondaryColor: formData.get('secondaryColor') as string,
    };

    updateSettingsMutation.mutate(settingsData);
  };

  if (loadingInvoices) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage customer invoices and billing</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Invoice Settings</DialogTitle>
                <DialogDescription>
                  Configure your company information and invoice appearance
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      defaultValue={settings?.companyName || 'OCUS Job Hunter'}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <Input
                      id="companyEmail"
                      name="companyEmail"
                      type="email"
                      defaultValue={settings?.companyEmail || ''}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Textarea
                    id="companyAddress"
                    name="companyAddress"
                    defaultValue={settings?.companyAddress || ''}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyPhone">Phone</Label>
                    <Input
                      id="companyPhone"
                      name="companyPhone"
                      defaultValue={settings?.companyPhone || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyWebsite">Website</Label>
                    <Input
                      id="companyWebsite"
                      name="companyWebsite"
                      defaultValue={settings?.companyWebsite || ''}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                    <Input
                      id="invoicePrefix"
                      name="invoicePrefix"
                      defaultValue={settings?.invoicePrefix || 'INV'}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <Input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      defaultValue={settings?.primaryColor || '#007bff'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <Input
                      id="secondaryColor"
                      name="secondaryColor"
                      type="color"
                      defaultValue={settings?.secondaryColor || '#6c757d'}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="footerText">Footer Text</Label>
                  <Input
                    id="footerText"
                    name="footerText"
                    defaultValue={settings?.footerText || 'Thank you for your business!'}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowSettingsDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Create a new invoice for a customer
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div>
                  <Label htmlFor="customerId">Customer ID</Label>
                  <Input id="customerId" name="customerId" required />
                </div>
                
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input id="customerName" name="customerName" required />
                </div>
                
                <div>
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input id="customerEmail" name="customerEmail" type="email" required />
                </div>
                
                <div>
                  <Label htmlFor="productName">Product/Service</Label>
                  <Input id="productName" name="productName" defaultValue="OCUS Job Hunter Extension" required />
                </div>
                
                <div>
                  <Label htmlFor="productDescription">Description</Label>
                  <Input id="productDescription" name="productDescription" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" name="quantity" type="number" defaultValue="1" min="1" required />
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">Unit Price</Label>
                    <Input id="unitPrice" name="unitPrice" type="number" step="0.01" min="0" required />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" rows={3} />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createInvoiceMutation.isPending}>
                    {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No invoices found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-4">
                No invoices have been created yet. Create your first invoice to get started.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Invoice
              </Button>
            </CardContent>
          </Card>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Invoice #{invoice.invoiceNumber}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {invoice.customerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {invoice.currency.toUpperCase()} {parseFloat(invoice.totalAmount).toFixed(2)}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Email:</span> {invoice.customerEmail}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Due Date:</span> {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                    </p>
                    {invoice.paidAt && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        <span className="font-medium">Paid on:</span> {format(new Date(invoice.paidAt), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPDF(invoice.id, invoice.invoiceNumber)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}