import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, CheckCircle, Clock, Shield, AlertTriangle, Chrome, Key, ExternalLink, CreditCard, Download, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Stripe will be initialized dynamically with the public key from API
let stripePromise: Promise<any> | null = null;

interface Order {
  id: number;
  customerEmail: string;
  customerName: string;
  originalAmount: string;
  finalAmount: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'stripe' | 'paypal';
  downloadToken: string;
  downloadCount: number;
  maxDownloads: number;
  activationCode?: string;
  createdAt: string;
  completedAt?: string;
}

interface UserPurchasesProps {
  userId?: number;
}

// Purchase form component
function PurchaseForm({ onSuccess, paymentIntentId }: { onSuccess: () => void; paymentIntentId?: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?tab=orders`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Payment succeeded - complete the order
        try {
          if (paymentIntentId) {
            // Complete the payment on our backend
            await apiRequest('POST', '/api/complete-stripe-payment', {
              paymentIntentId: paymentIntentId,
              customerEmail: 'user@example.com',
              customerName: 'User'
            });
          }
          
          toast({
            title: "Payment Successful!",
            description: "Your extension purchase is complete. Check your orders for the activation code.",
          });
          onSuccess();
        } catch (completionError) {
          console.error('Payment completion error:', completionError);
          toast({
            title: "Payment Completed",
            description: "Payment was successful. Your order will be processed shortly.",
          });
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };



  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Purchase Extension
          </>
        )}
      </Button>
    </form>
  );
}

// Purchase dialog wrapper with Stripe Elements
function PurchaseDialog({ onSuccess, userId }: { onSuccess: () => void; userId?: number }) {
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const { toast } = useToast();

  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };

  // Fetch client secret when dialog opens
  React.useEffect(() => {
    if (open && !clientSecret) {
      // First get the active countdown banner to get the correct price
      apiRequest('GET', '/api/countdown-banner/active')
        .then((response) => response.json())
        .then((bannerData) => {
          const amount = parseFloat(bannerData.targetPrice);
          const currency = 'eur'; // Use EUR as set in admin dashboard
          
          return apiRequest('POST', '/api/create-user-payment-intent', {
            amount: amount,
            currency: currency,
            userId: userId,
            customerEmail: 'user@example.com',
            customerName: 'User',
            productId: 'ocus-extension'
          });
        })
        .then((response) => response.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
          // Extract payment intent ID from client secret
          const piId = data.clientSecret.split('_secret_')[0];
          setPaymentIntentId(piId);
          
          // Initialize Stripe with the public key from the response
          if (data.publishableKey && !stripePromise) {
            stripePromise = loadStripe(data.publishableKey);
          }
        })
        .catch((error) => {
          console.error('Error creating payment intent:', error);
          toast({
            title: "Error",
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [open, clientSecret, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
          <Plus className="w-4 h-4 mr-2" />
          Purchase Extension
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase OCUS Job Hunter Extension</DialogTitle>
          <DialogDescription>
            Get unlimited access to the OCUS Job Hunter Chrome extension. After purchase, you'll get direct download access to the premium version.
          </DialogDescription>
        </DialogHeader>
        {clientSecret && stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PurchaseForm onSuccess={handleSuccess} paymentIntentId={paymentIntentId} />
          </Elements>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-gray-600">
              {clientSecret ? 'Waiting for Stripe to initialize...' : 'Initializing payment...'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function UserPurchases({ userId }: UserPurchasesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handlePurchaseSuccess = () => {
    // Refresh orders list after successful purchase
    queryClient.invalidateQueries({ queryKey: ['/api/user/orders'] });
    toast({
      title: "Purchase Complete",
      description: "Your order has been processed. Premium extension download is now available!",
    });
  };

  // Get product pricing from admin settings
  const { data: pricing } = useQuery({
    queryKey: ['/api/products/pricing'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/products/pricing');
      return res.json();
    },
  });

  // Get user orders
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['/api/user/orders', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/user/${userId}/orders`);
      return response.json();
    },
    enabled: !!userId
  });

  // Download file mutation
  const downloadMutation = useMutation({
    mutationFn: async (downloadToken: string) => {
      const response = await fetch(`/api/download/${downloadToken}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ocus-extension-v2.1.9-INSTALLATION-SYSTEM.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Your extension download has started.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download the extension.",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/user/orders'] });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✓ Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⏳ Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">✗ Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">↩ Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!userId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Please log in to view your purchase history.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Purchase Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Purchase Extension
            </div>
          </CardTitle>
          <CardDescription>
            Purchase the OCUS Job Hunter Chrome extension for unlimited mission acceptance. Get instant access to premium downloads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div>
              <h3 className="font-semibold text-lg">{pricing?.name || 'OCUS Job Hunter Pro'}</h3>
              <p className="text-sm text-gray-600">{pricing?.description || 'Unlimited mission acceptance, auto-login, 24/7 monitoring'}</p>
              <div className="flex items-center gap-2 mt-1">
                {pricing?.originalPrice && pricing.originalPrice !== pricing.price && (
                  <span className="text-sm text-gray-500 line-through">
                    €{pricing.originalPrice}
                  </span>
                )}
                <p className="text-xl font-bold text-primary">
                  €{pricing?.price || '39.99'}
                </p>
                {pricing?.originalPrice && pricing.originalPrice !== pricing.price && (
                  <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                    Save €{(parseFloat(pricing.originalPrice) - parseFloat(pricing.price)).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <PurchaseDialog onSuccess={handlePurchaseSuccess} userId={userId} />
          </div>
        </CardContent>
      </Card>

      {/* Orders History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Purchase History
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          ) : error ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load orders. Please try again later.
              </AlertDescription>
            </Alert>
          ) : !orders || !Array.isArray(orders) || orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No orders found. Purchase the extension to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(orders) && orders.map((order: Order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-lg font-bold text-primary mt-1">
                        {order.currency.toUpperCase()} {order.finalAmount}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium capitalize">{order.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Downloads Used</p>
                      <p className="font-medium">{order.downloadCount} / {order.maxDownloads}</p>
                    </div>
                  </div>

                  {order.status === 'completed' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Premium Access Unlocked</p>
                          <p className="text-sm text-gray-600">You can now download the premium extension version</p>
                        </div>
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  )}

                  {order.status === 'completed' && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={async () => {
                          try {
                            const response = await apiRequest('GET', '/api/download-extension/premium');
                            if (response.ok) {
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'ocus-job-hunter-premium-v2.1.8-STABLE.zip';
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            }
                          } catch (e) {}
                        }}
                        disabled={downloadMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Premium Extension
                      </Button>
                      <Button
                        onClick={async () => {
                          try {
                            const response = await apiRequest('GET', '/api/download-extension/trial');
                            if (response.ok) {
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'ocus-job-hunter-trial-v2.1.8-STABLE.zip';
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            }
                          } catch (e) {
                            toast({
                              title: 'Error',
                              description: 'Failed to download trial extension',
                              variant: 'destructive',
                            });
                          }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Trial (Backup)
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}