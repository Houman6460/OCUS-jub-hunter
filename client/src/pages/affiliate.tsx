import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, DollarSign, Users, TrendingUp, Eye, Download, Share2, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AffiliateStats {
  totalEarnings: string;
  totalReferrals: number;
  pendingCommission: string;
  paidCommission: string;
  conversionRate: number;
  referralCode: string;
  referralLink: string;
}

interface AffiliateTransaction {
  id: number;
  commission: string;
  status: string;
  createdAt: string;
  orderId: number;
  customerEmail: string;
  orderAmount: string;
}

interface PayoutRequest {
  id: number;
  amount: string;
  paymentMethod: string;
  status: string;
  requestedAt: string;
  processedAt?: string;
}

export default function AffiliatePage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [payoutAmount, setPayoutAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [paymentEmail, setPaymentEmail] = useState('');
  const [bankDetails, setBankDetails] = useState('');

  // Fetch affiliate dashboard data
  const { data: affiliateData, isLoading } = useQuery({
    queryKey: ['/api/affiliate/dashboard'],
    enabled: true
  });

  // Create affiliate account mutation
  const createAffiliateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/affiliate/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to create affiliate account');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/dashboard'] });
      toast({
        title: "Success",
        description: "Affiliate account created successfully!"
      });
    }
  });

  // Request payout mutation
  const requestPayoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/affiliate/request-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(payoutAmount),
          paymentMethod,
          paymentDetails: {
            email: paymentEmail,
            bankDetails: paymentMethod === 'bank' ? bankDetails : null
          }
        })
      });
      if (!response.ok) throw new Error('Failed to request payout');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/dashboard'] });
      setPayoutAmount('');
      setPaymentEmail('');
      setBankDetails('');
      toast({
        title: "Success",
        description: "Payout request submitted successfully!"
      });
    }
  });

  const copyReferralLink = () => {
    if (affiliateData?.referralLink) {
      navigator.clipboard.writeText(affiliateData.referralLink);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard"
      });
    }
  };

  const copyReferralCode = () => {
    if (affiliateData?.affiliate?.referralCode) {
      navigator.clipboard.writeText(affiliateData.affiliate.referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If user is not an affiliate yet
  if (!affiliateData?.affiliate?.referralCode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Join Our Affiliate Program</h1>
          <p className="text-muted-foreground mb-8">
            Earn 10% commission on every sale you refer. Start earning today!
          </p>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Affiliate Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span>10% commission on all sales</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Unlimited referrals</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span>Real-time tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-orange-500" />
                <span>Monthly payouts via PayPal</span>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={() => createAffiliateMutation.mutate()}
            disabled={createAffiliateMutation.isPending}
            size="lg"
          >
            {createAffiliateMutation.isPending ? 'Creating...' : 'Become an Affiliate'}
          </Button>
        </div>
      </div>
    );
  }

  const stats = affiliateData.stats || {};
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Affiliate Dashboard</h1>
        <p className="text-muted-foreground">
          Track your referrals and earnings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${affiliateData.affiliate?.totalEarnings || '0.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingCommissions || '0.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateData.affiliate?.commissionRate || '10'}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Referral Information</CardTitle>
                <CardDescription>
                  Share your referral code or link to start earning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="referralCode">Referral Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="referralCode"
                      value={affiliateData.affiliate.referralCode}
                      readOnly
                    />
                    <Button variant="outline" size="icon" onClick={copyReferralCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="referralLink">Referral Link</Label>
                  <div className="flex gap-2">
                    <Input
                      id="referralLink"
                      value={affiliateData.referralLink}
                      readOnly
                    />
                    <Button variant="outline" size="icon" onClick={copyReferralLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button className="w-full" onClick={copyReferralLink}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Referral Link
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Payout</CardTitle>
                <CardDescription>
                  Minimum payout is $50. Payouts are processed within 5-7 business days.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="50"
                    step="0.01"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="50.00"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === 'paypal' && (
                  <div>
                    <Label htmlFor="paypalEmail">PayPal Email</Label>
                    <Input
                      id="paypalEmail"
                      type="email"
                      value={paymentEmail}
                      onChange={(e) => setPaymentEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div>
                    <Label htmlFor="bankDetails">Bank Details</Label>
                    <Textarea
                      id="bankDetails"
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                      placeholder="Bank name, account number, routing number, etc."
                    />
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={() => requestPayoutMutation.mutate()}
                  disabled={
                    requestPayoutMutation.isPending || 
                    !payoutAmount || 
                    parseFloat(payoutAmount) < 50 ||
                    (!paymentEmail && paymentMethod === 'paypal') ||
                    (!bankDetails && paymentMethod === 'bank')
                  }
                >
                  {requestPayoutMutation.isPending ? 'Processing...' : 'Request Payout'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
              <CardDescription>
                Track your recent referral activity and commissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {affiliateData.recentTransactions?.length > 0 ? (
                <div className="space-y-4">
                  {affiliateData.recentTransactions.map((transaction: AffiliateTransaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Order #{transaction.orderId}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.customerEmail}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${transaction.commission}</p>
                        <Badge variant={
                          transaction.status === 'paid' ? 'default' :
                          transaction.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No referrals yet. Start sharing your referral link!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                View your payout requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {affiliateData.payoutHistory?.length > 0 ? (
                <div className="space-y-4">
                  {affiliateData.payoutHistory.map((payout: PayoutRequest) => (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">${payout.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {payout.paymentMethod}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Requested: {new Date(payout.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          payout.status === 'paid' ? 'default' :
                          payout.status === 'processing' ? 'secondary' : 'outline'
                        }>
                          {payout.status}
                        </Badge>
                        {payout.processedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Processed: {new Date(payout.processedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No payout requests yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Materials</CardTitle>
              <CardDescription>
                Use these materials to promote OCUS Job Hunter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Sample Social Media Posts</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      🎯 Just discovered OCUS Job Hunter - the Chrome extension that finds photography jobs 10x faster! 
                      Perfect for photographers on delivery platforms. Get 70% off with my link: {affiliateData.referralLink}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      📸 Tired of manually searching for photography gigs? OCUS Job Hunter automatically finds and filters 
                      the best jobs for you. Try it now: {affiliateData.referralLink}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Email Template</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    Subject: Boost Your Photography Income with This Chrome Extension<br/><br/>
                    
                    Hi [Name],<br/><br/>
                    
                    I wanted to share something that's been a game-changer for my photography work. 
                    OCUS Job Hunter is a Chrome extension that automatically finds and filters photography 
                    jobs on delivery platforms like Uber Eats and Foodora.<br/><br/>
                    
                    Instead of spending hours manually searching, it does the work for you and highlights 
                    the most profitable opportunities. Right now they're offering 70% off:<br/><br/>
                    
                    {affiliateData.referralLink}<br/><br/>
                    
                    Best regards,<br/>
                    [Your Name]
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Key Features to Highlight</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Automatic job detection and filtering</li>
                  <li>• Real-time notifications for new opportunities</li>
                  <li>• Profit calculator for each job</li>
                  <li>• Works with all major delivery platforms</li>
                  <li>• One-time payment, lifetime access</li>
                  <li>• 70% discount available</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}