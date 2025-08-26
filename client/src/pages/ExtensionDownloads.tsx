import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Shield, Clock, Star, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ExtensionDownloads() {
  const [downloading, setDownloading] = useState<'trial' | 'premium' | null>(null);

  const handleDownload = async (version: 'trial' | 'premium') => {
    setDownloading(version);
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('customer_token') || localStorage.getItem('user_token') || 'demo-jwt-token';
      
      const response = await fetch(`/api/download-extension/${version}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocus-job-hunter-${version}-v2.1.8-STABLE.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Show success message
        if (version === 'premium') {
          alert('Premium Version Downloaded - Latest premium extension (v2.1.8) with single-device license and unlimited access downloaded successfully!');
        } else {
          alert('Trial Version Downloaded - Latest trial extension (v2.1.8) with improved "Tests Available" display downloaded successfully!');
        }
      } else {
        throw new Error(`Download failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Download error:', error instanceof Error ? error.message : error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            OCUS Job Hunter Chrome Extension
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Automate your OCUS job hunting with our intelligent Chrome extension. 
            Choose between our trial version to test the features or go premium for unlimited access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Trial Version Card */}
          <Card className="relative border-2 border-orange-200 hover:border-orange-300 transition-colors">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-6 w-6 text-orange-600" />
                <CardTitle className="text-2xl">Trial Version</CardTitle>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                  FREE
                </Badge>
              </div>
              <CardDescription className="text-lg">
                Test our extension with 3 free mission accepts
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>3 free mission accepts</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Full automation features</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Mission detection & acceptance</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Floating panel counter</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  <span className="text-gray-600">Limited to 3 missions only</span>
                </div>
              </div>

              <Separator />

              <div className="text-center">
                <Button 
                  onClick={() => handleDownload('trial')}
                  disabled={downloading === 'trial'}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  size="lg"
                >
                  {downloading === 'trial' ? (
                    <>Downloading...</>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Download Trial Version
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Perfect for testing before purchase
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Premium Version Card */}
          <Card className="relative border-2 border-green-200 hover:border-green-300 transition-colors">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-green-600 hover:bg-green-700 text-white px-4 py-1">
                RECOMMENDED
              </Badge>
            </div>
            
            <CardHeader className="text-center pt-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-6 w-6 text-green-600" />
                <CardTitle className="text-2xl">Premium Version</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                  UNLIMITED
                </Badge>
              </div>
              <CardDescription className="text-lg">
                Unlimited mission accepts for serious job hunters
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Unlimited mission accepts</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Advanced automation features</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Priority mission detection</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Enhanced floating panel</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium text-green-700">No limitations</span>
                </div>
              </div>

              <Separator />

              <div className="text-center">
                <Button 
                  onClick={() => handleDownload('premium')}
                  disabled={downloading === 'premium'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {downloading === 'premium' ? (
                    <>Downloading...</>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Download Premium Version
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  For users who purchased the premium license
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Installation Instructions */}
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-xl">Installation Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Step 1: Download Extension</h3>
                <p className="text-gray-600">
                  Choose either the Trial version (3 missions) or Premium version (unlimited) 
                  and download the ZIP file to your computer.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Step 2: Extract Files</h3>
                <p className="text-gray-600">
                  Extract the downloaded ZIP file to a folder on your computer. 
                  Remember the location as you'll need it for installation.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Step 3: Open Chrome Extensions</h3>
                <p className="text-gray-600">
                  Open Google Chrome, go to chrome://extensions/, 
                  and enable "Developer mode" using the toggle in the top right.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Step 4: Load Extension</h3>
                <p className="text-gray-600">
                  Click "Load unpacked" and select the folder where you extracted the extension files. 
                  The extension will be installed and ready to use.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Need help? Contact our support team for assistance with installation or usage.
          </p>
        </div>
      </div>
    </div>
  );
}