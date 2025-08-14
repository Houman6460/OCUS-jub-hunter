import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function DownloadExtension() {
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleVersionDownload = async (filename: string) => {
    setDownloadStarted(true);
    try {
      // Try to fetch the file directly  
      const response = await fetch(`/api/download-extension/${filename}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Download failed:', response.statusText);
        alert('Download failed. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
    
    setTimeout(() => setDownloadStarted(false), 3000);
  };

  const handleDownload = () => handleVersionDownload("ocus-extension-v2.3.0-VISUAL-PREMIUM-UI.zip");

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Download Chrome Extension</h1>
            <p className="text-slate-600 text-lg">
              Get the latest version with premium UI and enhanced activation system
            </p>
          </div>

          <div className="space-y-6">
            {/* Download Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-blue-800">
                  Latest Version: v2.3.0-VISUAL-PREMIUM-UI
                </h2>
              </div>
              
              <div className="space-y-3">
                <p className="text-blue-700">
                  ✨ NEW: Dramatic visual premium transformation<br/>
                  🎯 Clear premium status indicators and UI changes<br/>
                  🔧 Server-connected activation with master key fallback<br/>
                  💎 Premium branding throughout interface<br/>
                  🚀 Success alerts and unlimited access confirmation
                </p>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleVersionDownload("ocus-extension-v2.1.9-INSTALLATION-SYSTEM.zip")}
                    size="lg"
                    disabled={downloadStarted}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloadStarted ? 'Download Started...' : 'Download Extension v2.1.9'}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="lg"
                    asChild
                  >
                    <a 
                      href="/uploads/ocus-extension-v2.1.9-INSTALLATION-SYSTEM.zip"
                      download="ocus-extension-v2.1.9-INSTALLATION-SYSTEM.zip"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Direct Download
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Previous Version */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Previous Version: v2.1.8-ACTIVATION-FIXED
                </h2>
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-700">
                  ✅ Fixed activation code validation<br/>
                  ✅ Corrected API endpoint integration<br/>
                  ✅ Basic activation system (legacy)<br/>
                  ⚠️ No installation tracking or security features
                </p>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleVersionDownload("ocus-extension-v2.1.8-ACTIVATION-FIXED.zip")}
                    size="sm"
                    variant="outline"
                    disabled={downloadStarted}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download v2.1.8 (Legacy)
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="lg"
                    asChild
                  >
                    <a 
                      href="/uploads/ocus-extension-v2.1.8-ACTIVATION-FIXED.zip"
                      download="ocus-extension-v2.1.8-ACTIVATION-FIXED.zip"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Direct Download
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Installation Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Installation Instructions</h3>
              <ol className="space-y-2 text-blue-700">
                <li>1. Download the extension zip file above</li>
                <li>2. Extract the zip file to a folder on your computer</li>
                <li>3. Open Chrome and go to <code className="bg-blue-100 px-1 rounded">chrome://extensions/</code></li>
                <li>4. Enable "Developer mode" in the top right corner</li>
                <li>5. Click "Load unpacked" and select the extracted folder</li>
                <li>6. The extension should now appear in your Chrome toolbar</li>
              </ol>
            </div>

            {/* Test Activation Codes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">Test Activation Codes</h3>
              <p className="text-yellow-700 mb-3">Use these codes to test the activation system:</p>
              <div className="space-y-2">
                <div className="bg-yellow-100 p-2 rounded font-mono text-sm">
                  OCUS-1754316351584-AL6F45VR
                </div>
                <div className="bg-yellow-100 p-2 rounded font-mono text-sm">
                  OCUS-1754315835831-XPC8SBIQ
                </div>
              </div>
              <p className="text-yellow-600 text-sm mt-2">
                Or generate a new one by completing a purchase through the checkout page.
              </p>
            </div>

            {/* Troubleshooting */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-red-800">Troubleshooting</h3>
              </div>
              <div className="space-y-2 text-red-700">
                <p><strong>If activation fails:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Make sure the backend server is running on localhost:5000</li>
                  <li>Check browser console (F12) for error messages</li>
                  <li>Ensure the activation code format is correct (starts with OCUS-)</li>
                  <li>Try the debug page at <code className="bg-red-100 px-1 rounded">/debug-activation</code></li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}