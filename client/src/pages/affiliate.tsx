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
  commissionRate: number;
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

interface AffiliateDashboardData {
  affiliate?: AffiliateStats;
  stats?: {
    totalReferrals: number;
    pendingCommission: string;
  };
  recentTransactions?: AffiliateTransaction[];
  payoutHistory?: PayoutRequest[];
  referralLink?: string;
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
  const { data: affiliateData, isLoading } = useQuery<AffiliateDashboardData>({
    queryKey: ['/api/affiliate/dashboard'],
    enabled: true,
  });

  // Create affiliate account mutation
  const createAffiliateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/affiliate/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t.affiliate.create_account_failed);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/dashboard'] });
      toast({
        title: t.success,
        description: t.affiliate.create_account_success,
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : t.an_unknown_error_occurred;
      toast({ title: t.error, description: message, variant: 'destructive' });
    },
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
            bankDetails: paymentMethod === 'bank' ? bankDetails : null,
          },
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t.affiliate.payout_request_failed);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/dashboard'] });
      setPayoutAmount('');
      setPaymentEmail('');
      setBankDetails('');
      toast({
        title: t.success,
        description: t.affiliate.payout_request_success,
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : t.an_unknown_error_occurred;
      toast({ title: t.error, description: message, variant: 'destructive' });
    },
  });

  const copyReferralLink = () => {
    if (affiliateData?.referralLink) {
      navigator.clipboard.writeText(affiliateData.referralLink);
      toast({
        title: t.affiliate.copied,
        description: t.affiliate.referral_link_copied,
      });
    }
  };

  const copyReferralCode = () => {
    if (affiliateData?.affiliate?.referralCode) {
      navigator.clipboard.writeText(affiliateData.affiliate.referralCode);
      toast({
        title: t.affiliate.copied,
        description: t.affiliate.referral_code_copied,
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
          <h1 className="text-3xl font-bold mb-4">{t.affiliate.join_program_title}</h1>
          <p className="text-muted-foreground mb-8">{t.affiliate.join_program_subtitle}</p>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t.affiliate.benefits_title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span>{t.affiliate.benefit_commission}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <span>{t.affiliate.benefit_referrals}</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span>{t.affiliate.benefit_tracking}</span>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-orange-500" />
                <span>{t.affiliate.benefit_payouts}</span>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => createAffiliateMutation.mutate()}
            disabled={createAffiliateMutation.isPending}
            size="lg"
          >
            {createAffiliateMutation.isPending ? t.affiliate.creating_button : t.affiliate.become_affiliate_button}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t.affiliate.dashboard_title}</h1>
        <p className="text-muted-foreground">{t.affiliate.dashboard_subtitle}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.affiliate.total_earnings}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${affiliateData?.affiliate?.totalEarnings ?? '0.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.affiliate.total_referrals}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateData?.stats?.totalReferrals ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.affiliate.pending_commission}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${affiliateData?.stats?.pendingCommission ?? '0.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.affiliate.commission_rate}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateData?.affiliate?.commissionRate ?? '10'}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t.affiliate.tabs_overview}</TabsTrigger>
          <TabsTrigger value="referrals">{t.affiliate.tabs_referrals}</TabsTrigger>
          <TabsTrigger value="payouts">{t.affiliate.tabs_payouts}</TabsTrigger>
          <TabsTrigger value="marketing">{t.affiliate.tabs_marketing}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.affiliate.referral_info_title}</CardTitle>
                <CardDescription>{t.affiliate.referral_info_subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="referralCode">{t.affiliate.referral_code_label}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="referralCode"
                      value={affiliateData?.affiliate?.referralCode ?? ''}
                      readOnly
                    />
                    <Button variant="outline" size="icon" onClick={copyReferralCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="referralLink">{t.affiliate.referral_link_label}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="referralLink"
                      value={affiliateData?.referralLink ?? ''}
                      readOnly
                    />
                    <Button variant="outline" size="icon" onClick={copyReferralLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button className="w-full" onClick={copyReferralLink}>
                  <Share2 className="mr-2 h-4 w-4" />
                  {t.affiliate.share_referral_link_button}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.affiliate.request_payout_title}</CardTitle>
                <CardDescription>{t.affiliate.request_payout_subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">{t.affiliate.amount_label}</Label>
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
                  <Label htmlFor="paymentMethod">{t.affiliate.payment_method_label}</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.affiliate.select_payment_method} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">{t.affiliate.paypal}</SelectItem>
                      <SelectItem value="bank">{t.affiliate.bank_transfer}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === 'paypal' && (
                  <div>
                    <Label htmlFor="paypalEmail">{t.affiliate.paypal_email_label}</Label>
                    <Input
                      id="paypalEmail"
                      type="email"
                      value={paymentEmail}
                      onChange={(e) => setPaymentEmail(e.target.value)}
                      placeholder={t.affiliate.paypal_email_placeholder}
                    />
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div>
                    <Label htmlFor="bankDetails">{t.affiliate.bank_details_label}</Label>
                    <Textarea
                      id="bankDetails"
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                      placeholder={t.affiliate.bank_details_placeholder}
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
                    (paymentMethod === 'paypal' && !paymentEmail) ||
                    (paymentMethod === 'bank' && !bankDetails)
                  }
                >
                  {requestPayoutMutation.isPending
                    ? t.affiliate.processing_button
                    : t.affiliate.request_payout_button}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.affiliate.recent_referrals_title}</CardTitle>
              <CardDescription>{t.affiliate.recent_referrals_subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              {affiliateData?.recentTransactions?.length ?? 0 > 0 ? (
                <div className="space-y-4">
                  {affiliateData?.recentTransactions?.map((transaction: AffiliateTransaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {t.affiliate.order_prefix}#{transaction.orderId}
                        </p>
                        <p className="text-sm text-muted-foreground">{transaction.customerEmail}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${transaction.commission}</p>
                        <Badge
                          variant={
                            transaction.status === 'paid'
                              ? 'default'
                              : transaction.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t.affiliate.no_referrals_message}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.affiliate.payout_history_title}</CardTitle>
              <CardDescription>{t.affiliate.payout_history_subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              {affiliateData?.payoutHistory?.length ?? 0 > 0 ? (
                <div className="space-y-4">
                  {affiliateData?.payoutHistory?.map((payout: PayoutRequest) => (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">${payout.amount}</p>
                        <p className="text-sm text-muted-foreground">{payout.paymentMethod}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.affiliate.requested_prefix}{' '}
                          {new Date(payout.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            payout.status === 'paid'
                              ? 'default'
                              : payout.status === 'processing'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {payout.status}
                        </Badge>
                        {payout.processedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t.affiliate.processed_prefix}{' '}
                            {new Date(payout.processedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t.affiliate.no_payout_requests_message}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.affiliate.marketing_materials_title}</CardTitle>
              <CardDescription>{t.affiliate.marketing_materials_subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">{t.affiliate.social_media_title}</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      {t.affiliate.social_post_1.replace('{referralLink}', affiliateData?.referralLink ?? '')}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      {t.affiliate.social_post_2.replace('{referralLink}', affiliateData?.referralLink ?? '')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">{t.affiliate.email_template_title}</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p
                    className="text-sm"
                    dangerouslySetInnerHTML={{
                      __html: t.affiliate.email_template_body
                        .replace('{referralLink}', affiliateData?.referralLink ?? '')
                        .replace(/\n/g, '<br />'),
                    }}
                  ></p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">{t.affiliate.key_features_title}</h3>
                <ul className="space-y-2 text-sm">
                  {t.affiliate.key_features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}