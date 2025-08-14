import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Users, TrendingUp, CheckCircle, XCircle, Eye, Download, Settings2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';

interface AffiliateStats {
  totalAffiliates: number;
  totalCommissions: string;
  pendingPayouts: {
    count: number;
    total: string;
  };
  topAffiliates: Array<{
    id: string;
    name: string;
    email: string;
    referralCode: string;
    totalEarnings: string;
    totalReferrals: number;
    totalCommissions: string;
  }>;
}

interface PayoutRequest {
  id: number;
  affiliateId: string;
  amount: string;
  paymentMethod: string;
  paymentEmail: string;
  status: string;
  requestedAt: string;
  affiliate: {
    name: string;
    email: string;
  };
}

// Affiliate Settings Component
function AffiliateSettingsCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rewardType, setRewardType] = useState('percentage');
  const [commissionRate, setCommissionRate] = useState('10.00');
  const [fixedAmount, setFixedAmount] = useState('5.00');
  const [minPayout, setMinPayout] = useState('50.00');
  const [cookieLifetime, setCookieLifetime] = useState('30');
  const [autoApproval, setAutoApproval] = useState(false);
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState('100.00');
  const [payoutFrequency, setPayoutFrequency] = useState('monthly');

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/affiliate/admin/settings'],
    refetchInterval: false
  });

  // Update form values when settings load
  useEffect(() => {
    if (settings) {
      setRewardType(settings.defaultRewardType || 'fixed');
      setCommissionRate(settings.defaultCommissionRate || '10.00');
      setFixedAmount(settings.defaultFixedAmount || '25.00');
      setMinPayout(settings.minPayoutAmount || '50.00');
      setCookieLifetime(settings.cookieLifetimeDays?.toString() || '30');
      setAutoApproval(settings.autoApprovalEnabled || false);
      setAutoApprovalThreshold(settings.autoApprovalThreshold || '100.00');
      setPayoutFrequency(settings.payoutFrequency || 'monthly');
    }
  }, [settings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', '/api/affiliate/admin/settings', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/admin/settings'] });
      toast({
        title: "Success",
        description: "Affiliate settings updated successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update affiliate settings",
        variant: "destructive"
      });
    }
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      defaultRewardType: rewardType,
      defaultCommissionRate: rewardType === 'percentage' ? commissionRate : null,
      defaultFixedAmount: rewardType === 'fixed' ? fixedAmount : null,
      minPayoutAmount: minPayout,
      cookieLifetimeDays: parseInt(cookieLifetime),
      autoApprovalEnabled: autoApproval,
      autoApprovalThreshold: autoApprovalThreshold,
      payoutFrequency: payoutFrequency
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Program Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Affiliate Program Settings
        </CardTitle>
        <CardDescription>
          Configure reward structure and program parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reward Type Selection */}
        <div>
          <Label htmlFor="rewardType">Reward Structure</Label>
          <Select value={rewardType} onValueChange={setRewardType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage Commission</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            Choose how affiliates earn rewards: percentage of sale or fixed amount per referral
          </p>
        </div>

        {/* Dynamic Reward Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewardType === 'percentage' ? (
            <div>
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Percentage of each sale amount
              </p>
            </div>
          ) : (
            <div>
              <Label htmlFor="fixedAmount">Fixed Reward Amount (€)</Label>
              <Input
                id="fixedAmount"
                type="number"
                min="0"
                step="0.50"
                value={fixedAmount}
                onChange={(e) => setFixedAmount(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Fixed amount per successful referral
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="minPayout">Minimum Payout Amount (€)</Label>
            <Input
              id="minPayout"
              type="number"
              min="10"
              step="5"
              value={minPayout}
              onChange={(e) => setMinPayout(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Minimum earnings required to request payout
            </p>
          </div>

          <div>
            <Label htmlFor="cookieLifetime">Referral Tracking Period (Days)</Label>
            <Input
              id="cookieLifetime"
              type="number"
              min="1"
              max="365"
              value={cookieLifetime}
              onChange={(e) => setCookieLifetime(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              How long to track referrals after initial visit
            </p>
          </div>

          <div>
            <Label htmlFor="payoutFrequency">Payout Schedule</Label>
            <Select value={payoutFrequency} onValueChange={setPayoutFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Automated payout processing frequency
            </p>
          </div>
        </div>

        {/* Auto-approval Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoApproval"
              checked={autoApproval}
              onChange={(e) => setAutoApproval(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="autoApproval">Enable Auto-approval</Label>
          </div>
          
          {autoApproval && (
            <div>
              <Label htmlFor="autoApprovalThreshold">Auto-approval Threshold ($)</Label>
              <Input
                id="autoApprovalThreshold"
                type="number"
                min="0"
                step="10"
                value={autoApprovalThreshold}
                onChange={(e) => setAutoApprovalThreshold(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Automatically approve commissions for orders above this amount
              </p>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Current Configuration Preview:</h4>
          <ul className="text-sm space-y-1">
            <li>
              <strong>Reward:</strong> {rewardType === 'percentage' 
                ? `${commissionRate}% commission` 
                : `$${fixedAmount} per referral`}
            </li>
            <li><strong>Minimum Payout:</strong> ${minPayout}</li>
            <li><strong>Tracking Period:</strong> {cookieLifetime} days</li>
            <li><strong>Auto-approval:</strong> {autoApproval ? `Orders ≥ $${autoApprovalThreshold}` : 'Disabled'}</li>
            <li><strong>Payout Schedule:</strong> {payoutFrequency}</li>
          </ul>
        </div>

        <Button 
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          className="w-full md:w-auto"
        >
          {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminAffiliatesPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [transactionId, setTransactionId] = useState('');

  // Fetch affiliate stats
  const { data: affiliateStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/affiliate-stats'],
    enabled: true
  });

  // Fetch pending payouts
  const { data: pendingPayouts, isLoading: payoutsLoading } = useQuery({
    queryKey: ['/api/admin/pending-payouts'],
    enabled: true
  });

  // Approve payout mutation
  const approvePayoutMutation = useMutation({
    mutationFn: async ({ payoutId, transactionId }: { payoutId: number; transactionId: string }) => {
      const response = await apiRequest('POST', `/api/admin/approve-payout/${payoutId}`, { transactionId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliate-stats'] });
      setSelectedPayout(null);
      setTransactionId('');
      toast({
        title: "Success",
        description: "Payout approved successfully!"
      });
    }
  });

  // Reject payout mutation
  const rejectPayoutMutation = useMutation({
    mutationFn: async (payoutId: number) => {
      const response = await apiRequest('POST', `/api/admin/reject-payout/${payoutId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliate-stats'] });
      setSelectedPayout(null);
      toast({
        title: "Success",
        description: "Payout rejected successfully!"
      });
    }
  });

  // Auto-approve commissions mutation
  const autoApproveCommissionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/auto-approve-commissions');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliate-stats'] });
      toast({
        title: "Success",
        description: "Commissions auto-approved successfully!"
      });
    }
  });

  if (statsLoading || payoutsLoading) {
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

  const stats: AffiliateStats = affiliateStats || {
    totalAffiliates: 0,
    totalCommissions: '0',
    pendingPayouts: { count: 0, total: '0' },
    topAffiliates: []
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Affiliate Management</h1>
        <p className="text-muted-foreground">
          Manage affiliate program, payouts, and performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAffiliates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCommissions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayouts.count}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.pendingPayouts.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => autoApproveCommissionsMutation.mutate()}
              disabled={autoApproveCommissionsMutation.isPending}
            >
              {autoApproveCommissionsMutation.isPending ? 'Processing...' : 'Auto-Approve'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payouts">Pending Payouts</TabsTrigger>
          <TabsTrigger value="affiliates">Top Affiliates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payout Requests</CardTitle>
              <CardDescription>
                Review and process affiliate payout requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPayouts && pendingPayouts.length > 0 ? (
                <div className="space-y-4">
                  {pendingPayouts.map((payout: PayoutRequest) => (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{payout.affiliate?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {payout.affiliate?.email}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">${payout.amount}</p>
                            <p className="text-sm text-muted-foreground">
                              via {payout.paymentMethod}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm">
                              {payout.paymentEmail}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(payout.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedPayout(payout)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Approve Payout</DialogTitle>
                              <DialogDescription>
                                Confirm payout details and enter transaction ID
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Affiliate</Label>
                                <p>{selectedPayout?.affiliate?.name}</p>
                              </div>
                              <div>
                                <Label>Amount</Label>
                                <p>${selectedPayout?.amount}</p>
                              </div>
                              <div>
                                <Label>Payment Method</Label>
                                <p>{selectedPayout?.paymentMethod}</p>
                              </div>
                              <div>
                                <Label>Payment Email</Label>
                                <p>{selectedPayout?.paymentEmail}</p>
                              </div>
                              <div>
                                <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                                <Input
                                  id="transactionId"
                                  value={transactionId}
                                  onChange={(e) => setTransactionId(e.target.value)}
                                  placeholder="Enter transaction ID or reference"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    if (selectedPayout) {
                                      approvePayoutMutation.mutate({
                                        payoutId: selectedPayout.id,
                                        transactionId
                                      });
                                    }
                                  }}
                                  disabled={approvePayoutMutation.isPending}
                                  className="flex-1"
                                >
                                  {approvePayoutMutation.isPending ? 'Processing...' : 'Approve Payout'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectPayoutMutation.mutate(payout.id)}
                          disabled={rejectPayoutMutation.isPending}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No pending payout requests.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Affiliates</CardTitle>
              <CardDescription>
                View your most successful affiliate partners
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topAffiliates.length > 0 ? (
                <div className="space-y-4">
                  {stats.topAffiliates.map((affiliate, index) => (
                    <div
                      key={affiliate.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{affiliate.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {affiliate.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Code: {affiliate.referralCode}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${affiliate.totalCommissions || '0.00'}</p>
                        <p className="text-sm text-muted-foreground">
                          {affiliate.totalReferrals} referrals
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total: ${affiliate.totalEarnings}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No affiliates found.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <AffiliateSettingsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}