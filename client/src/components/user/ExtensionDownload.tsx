import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, CheckCircle, Clock, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  email: string;
  name: string;
  isBlocked?: boolean;
  extensionActivated?: boolean;
  extensionTrialJobsUsed?: number;
  extensionTrialLimit?: number;
  activationKey?: string | null;
  activationKeyRevealed?: boolean;
  totalSpent?: string | number;
  blockedReason?: string | null;
}

interface PurchaseStatus {
  hasPurchased: boolean;
  totalSpent: string;
  completedOrders: number;
  lastPurchaseDate: number | null;
}

interface ExtensionStatus {
  canUse: boolean;
  reason?: string;
  trialUsed?: number;
  isBlocked?: boolean;
}

interface ExtensionDownload {
  id: number;
  downloadToken: string;
  downloadType: 'trial' | 'paid';
  downloadCount: number;
  createdAt: string;
}

interface ExtensionDownloadProps {
  customer: Customer;
}

export function ExtensionDownload({ customer }: ExtensionDownloadProps) {
  const [downloading, setDownloading] = useState<'trial' | 'premium' | null>(null);
  const { toast } = useToast();

  // Check extension usage status
  const { data: extensionStatus } = useQuery<ExtensionStatus>({
    queryKey: ['/api/extension/check', customer.id],
    queryFn: () => fetch(`/api/extension/check/${customer.id}`).then(res => res.json()),
  });

  // Get customer downloads
  const { data: downloads = [] } = useQuery<ExtensionDownload[]>({
    queryKey: ['/api/extension/downloads', customer.id],
    queryFn: () => fetch(`/api/extension/downloads/${customer.id}`).then(res => res.json()),
  });

  // Get real-time purchase status from orders
  const { data: purchaseStatus } = useQuery<PurchaseStatus>({
    queryKey: ['/api/user/purchase-status', customer.id],
    queryFn: () => fetch(`/api/user/${customer.id}/purchase-status`).then(res => res.json()),
  });

  // Direct download for trial version
  const handleTrialDownload = async () => {
    setDownloading('trial');
    try {
      const response = await fetch('/api/download-extension/trial');
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
        toast({
          title: 'Trial Version Downloaded',
          description: 'Latest trial extension (v2.1.8) with improved "Tests Available" display downloaded successfully!',
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download trial extension',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  };

  // Direct download for premium version
  const handlePremiumDownload = async () => {
    setDownloading('premium');
    try {
      const response = await fetch('/api/download-extension/premium');
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
        toast({
          title: 'Premium Version Downloaded',
          description: 'Latest premium extension (v2.1.8) with single-device license and unlimited access downloaded successfully!',
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download premium extension',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  };

  // Check if user has purchased premium - use real-time purchase status
  const hasPurchased = purchaseStatus?.hasPurchased || false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Extension Downloads
        </CardTitle>
        <CardDescription>
          Download and manage your OCUS Job Hunter Chrome Extension
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Account Status */}
        <div className="space-y-3">
          <h4 className="font-medium">Account Status</h4>
          <div className="flex items-center gap-2">
            {customer.isBlocked ? (
              <>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Blocked
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Your account has been blocked. Contact support for assistance.
                </span>
              </>
            ) : hasPurchased ? (
              <>
                <Badge variant="default" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Premium Activated
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Full access to all extension features - Total spent: €{purchaseStatus?.totalSpent || '0.00'}
                </span>
              </>
            ) : (
              <>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Trial Mode
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Limited trial access ({extensionStatus?.trialUsed || 0}/{customer.extensionTrialLimit || 50} jobs used)
                </span>
              </>
            )}
          </div>
          
          {!hasPurchased && extensionStatus && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Trial Progress</span>
                <span>{extensionStatus.trialUsed || 0}/{customer.extensionTrialLimit || 50}</span>
              </div>
              <Progress 
                value={((extensionStatus.trialUsed || 0) / (customer.extensionTrialLimit || 50)) * 100} 
                className="h-2"
              />
            </div>
          )}
        </div>

        {/* Account Blocked Alert */}
        {customer.isBlocked && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your account has been blocked: {customer.blockedReason}
              <br />Please contact support for assistance.
            </AlertDescription>
          </Alert>
        )}

        {/* Download Section */}
        <div className="space-y-6">
          <h4 className="font-medium text-lg">Extension Downloads</h4>
          
          {/* Trial Version */}
          <Card className="border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      TRIAL
                    </Badge>
                    <h5 className="font-medium">Trial Version</h5>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Test extension with 3 tests available - improved user experience
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Latest version with friendly "Tests Available" display
                  </p>
                </div>
                <Button
                  onClick={handleTrialDownload}
                  disabled={customer.isBlocked || downloading === 'trial'}
                  variant="outline"
                  className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Download className="w-4 h-4" />
                  {downloading === 'trial' ? 'Downloading...' : 'Download Trial'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Premium Version */}
          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" className="bg-green-600 text-white">
                      PREMIUM
                    </Badge>
                    <h5 className="font-medium">Premium Version</h5>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Unlimited mission accepts with single-device license - latest version v2.1.8-STABLE
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hasPurchased 
                      ? '🔒 Single-device license - Premium access activated for one device at a time'
                      : 'Complete purchase to unlock premium version with device validation'
                    }
                  </p>
                </div>
                <Button
                  onClick={handlePremiumDownload}
                  disabled={
                    customer.isBlocked || 
                    downloading === 'premium' || 
                    !hasPurchased
                  }
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  {downloading === 'premium' ? 'Downloading...' : 'Download Premium'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Installation Instructions */}
        <div className="space-y-3">
          <h4 className="font-medium">Installation Instructions</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>1. Download and extract the ZIP file</p>
            <p>2. Open Chrome and go to chrome://extensions/</p>
            <p>3. Enable "Developer mode" (top right toggle)</p>
            <p>4. Click "Load unpacked" and select the extracted folder</p>
          </div>
        </div>

        {/* Download History */}
        {downloads.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Download History</h4>
            <div className="space-y-2">
              {downloads.slice(0, 3).map((download) => (
                <div key={download.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {download.downloadType === 'trial' ? 'Trial Version' : 'Premium Version'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {download.downloadCount} downloads
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(download.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}