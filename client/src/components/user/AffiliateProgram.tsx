import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Copy, 
  Share2, 
  CreditCard,
  Check,
  Info,
  ArrowRight,
  Wallet,
  BanknoteIcon,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Customer {
  id: string;
  email: string;
  name: string;
  referralCode?: string;
}

interface AffiliateData {
  stats: {
    totalEarnings: string;
    pendingCommission: string;
    paidCommission: string;
    totalReferrals: number;
    conversionRate: number;
  };
  affiliate: {
    referralCode: string;
    paymentMethod?: string;
    paymentDetails?: any;
  };
  referralLink: string;
  recentTransactions: Array<{
    id: number;
    orderAmount: string;
    commission: string;
    status: string;
    createdAt: string;
    customerEmail: string;
  }>;
  payoutHistory: Array<{
    id: number;
    amount: string;
    status: string;
    createdAt: string;
    paymentMethod: string;
  }>;
}

interface AffiliateSettings {
  defaultCommissionRate: string;
  defaultFixedAmount: string;
  minPayoutAmount: string;
  defaultRewardType: string;
}

export function AffiliateProgram({ customer }: { customer: Customer }) {
  const queryClient = useQueryClient();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [paymentDetails, setPaymentDetails] = useState({
    paypal: '',
    bank_name: '',
    bank_account: '',
    bank_routing: '',
    stripe_account: ''
  });

  // Fetch affiliate data
  const { data: affiliateData, isLoading } = useQuery({
    queryKey: ['/api/affiliate/dashboard', customer.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/affiliate/dashboard/${customer.id}`);
      return await response.json();
    }
  });

  // Fetch affiliate settings
  const { data: settings } = useQuery({
    queryKey: ['/api/affiliate/settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/affiliate/settings');
      return await response.json();
    }
  });

  // Join affiliate program
  const joinAffiliateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/affiliate/create`, {
        customerId: customer.id,
        paymentEmail: customer.email
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Welcome to the Affiliate Program!',
        description: 'You can now start earning commissions by referring customers.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/dashboard', customer.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to join',
        description: error.message || 'Could not join affiliate program',
        variant: 'destructive',
      });
    }
  });

  // Update payment method
  const updatePaymentMutation = useMutation({
    mutationFn: async (data: { method: string; details: any }) => {
      const response = await apiRequest('POST', `/api/affiliate/payment-method/${customer.id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Payment Method Updated',
        description: 'Your payment details have been saved successfully.',
      });
      setShowPaymentDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/dashboard', customer.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not update payment method',
        variant: 'destructive',
      });
    }
  });

  // Request payout
  const requestPayoutMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest('POST', `/api/affiliate/request-payout/${customer.id}`, { 
        amount,
        paymentMethod: affiliateData?.affiliate.paymentMethod,
        paymentDetails: affiliateData?.affiliate.paymentDetails
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Payout Requested',
        description: 'Your payout request has been submitted for processing.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/dashboard', customer.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Payout Request Failed',
        description: error.message || 'Could not request payout',
        variant: 'destructive',
      });
    }
  });

  const copyReferralLink = () => {
    navigator.clipboard.writeText(affiliateData?.referralLink || '');
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
    });
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(affiliateData?.affiliate.referralCode || customer.referralCode || '');
    toast({
      title: 'Copied!',
      description: 'Referral code copied to clipboard',
    });
  };

  const handlePaymentSubmit = () => {
    const details = paymentMethod === 'paypal' 
      ? { email: paymentDetails.paypal }
      : paymentMethod === 'bank'
      ? {
          bank_name: paymentDetails.bank_name,
          account_number: paymentDetails.bank_account,
          routing_number: paymentDetails.bank_routing
        }
      : { account_id: paymentDetails.stripe_account };

    updatePaymentMutation.mutate({ method: paymentMethod, details });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If not an affiliate yet
  if (!affiliateData?.affiliate) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join Our Affiliate Program</CardTitle>
          <CardDescription className="text-base mt-2">
            Earn commissions by referring customers to OCUS Job Hunter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Program Benefits:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <strong>Fixed Commission Rate:</strong> Earn €{settings?.defaultFixedAmount || '25'} for every successful referral
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <strong>Lifetime Tracking:</strong> Your referrals are tracked for 30 days via cookies
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <strong>Real-time Dashboard:</strong> Track your earnings and conversions instantly
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <strong>Multiple Payment Options:</strong> PayPal, Bank Transfer, or Stripe
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <strong>Marketing Materials:</strong> Access to banners and promotional content
                </div>
              </li>
            </ul>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              By joining, you agree to promote OCUS Job Hunter ethically and in compliance with our terms of service.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={() => joinAffiliateMutation.mutate()} 
            className="w-full"
            size="lg"
            disabled={joinAffiliateMutation.isPending}
          >
            {joinAffiliateMutation.isPending ? 'Joining...' : 'Join Affiliate Program'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const pendingAmount = parseFloat(affiliateData.stats.pendingCommission);
  const minPayout = parseFloat(settings?.minPayoutAmount || '50');
  const canRequestPayout = pendingAmount >= minPayout && affiliateData.affiliate.paymentMethod;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{affiliateData.stats.totalEarnings}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">€{affiliateData.stats.pendingCommission}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateData.stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground mt-1">Successful conversions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateData.stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Click to purchase</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referral Info */}
            <Card>
              <CardHeader>
                <CardTitle>Your Referral Information</CardTitle>
                <CardDescription>Share your unique link or code to earn commissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Referral Code</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={affiliateData.affiliate.referralCode} readOnly />
                    <Button variant="outline" size="icon" onClick={copyReferralCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Referral Link</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={affiliateData.referralLink} readOnly className="text-sm" />
                    <Button variant="outline" size="icon" onClick={copyReferralLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    You earn €{settings?.defaultFixedAmount || '25'} for each successful referral who purchases the extension.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Payment Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure how you receive your commissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {affiliateData.affiliate.paymentMethod ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Payment Method</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {affiliateData.affiliate.paymentMethod}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        Configured
                      </Badge>
                    </div>
                    {pendingAmount >= minPayout && (
                      <Button 
                        onClick={() => requestPayoutMutation.mutate(pendingAmount)}
                        disabled={requestPayoutMutation.isPending}
                        className="w-full"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Request Payout (€{pendingAmount.toFixed(2)})
                      </Button>
                    )}
                  </div>
                ) : (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription>
                      Please configure your payment method to receive payouts.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(true)}
                  className="w-full"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {affiliateData.affiliate.paymentMethod ? 'Update' : 'Add'} Payment Method
                </Button>

                {pendingAmount < minPayout && pendingAmount > 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Minimum payout: €{minPayout} (Need €{(minPayout - pendingAmount).toFixed(2)} more)
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
              <CardDescription>Your latest successful conversions</CardDescription>
            </CardHeader>
            <CardContent>
              {affiliateData.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {affiliateData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{transaction.customerEmail}</p>
                        <p className="text-sm text-muted-foreground">
                          Order: €{transaction.orderAmount} • {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">€{transaction.commission}</p>
                        <Badge variant={transaction.status === 'approved' ? 'default' : 'secondary'} className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No referrals yet. Share your link to start earning!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Referrals</CardTitle>
              <CardDescription>Complete history of your referral conversions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Full referral history table would go here */}
              <p className="text-center py-8 text-muted-foreground">
                Detailed referral history coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Your commission payment history</CardDescription>
            </CardHeader>
            <CardContent>
              {affiliateData.payoutHistory.length > 0 ? (
                <div className="space-y-3">
                  {affiliateData.payoutHistory.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">€{payout.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payout.createdAt).toLocaleDateString()} • {payout.paymentMethod}
                        </p>
                      </div>
                      <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                        {payout.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No payouts yet. Request your first payout when you reach €{minPayout}.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Resources</CardTitle>
              <CardDescription>Tools and materials to help you promote OCUS Job Hunter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Share2 className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-medium">Social Media Kit</h4>
                      <p className="text-sm text-muted-foreground">
                        Pre-written posts and graphics for social sharing
                      </p>
                      <Button variant="outline" size="sm">
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <BanknoteIcon className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-medium">Email Templates</h4>
                      <p className="text-sm text-muted-foreground">
                        Professional email templates for outreach
                      </p>
                      <Button variant="outline" size="sm">
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Need custom marketing materials? Contact our affiliate support team.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Method Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Payment Method</DialogTitle>
            <DialogDescription>
              Choose how you'd like to receive your affiliate commissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="stripe">Stripe Connect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === 'paypal' && (
              <div>
                <Label>PayPal Email</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={paymentDetails.paypal}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, paypal: e.target.value }))}
                />
              </div>
            )}

            {paymentMethod === 'bank' && (
              <>
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    placeholder="Your Bank Name"
                    value={paymentDetails.bank_name}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, bank_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input
                    placeholder="Account Number"
                    value={paymentDetails.bank_account}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, bank_account: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Routing Number</Label>
                  <Input
                    placeholder="Routing Number"
                    value={paymentDetails.bank_routing}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, bank_routing: e.target.value }))}
                  />
                </div>
              </>
            )}

            {paymentMethod === 'stripe' && (
              <div>
                <Label>Stripe Connect Account ID</Label>
                <Input
                  placeholder="acct_1234567890"
                  value={paymentDetails.stripe_account}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, stripe_account: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You'll need to connect your Stripe account first
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePaymentSubmit}
              disabled={updatePaymentMutation.isPending}
            >
              {updatePaymentMutation.isPending ? 'Saving...' : 'Save Payment Method'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}