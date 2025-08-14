import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ActivationKey {
  id: number;
  activationKey: string;
  isActive: boolean;
  orderId: number;
  usedAt: string | null;
  createdAt: string;
}

export default function DebugActivation() {
  const { toast } = useToast();

  const { data: activationKeys, isLoading } = useQuery<ActivationKey[]>({
    queryKey: ['/api/recent-activation-keys'],
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Activation code copied to clipboard",
    });
  };

  const latestKey = localStorage.getItem('latestActivationKey');

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-6">Debug: Activation Codes</h1>
          
          <div className="space-y-6">
            {/* Latest from localStorage */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Latest from LocalStorage</h2>
              {latestKey ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-sm">{latestKey}</code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(latestKey)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-700">No activation code in localStorage yet</p>
                </div>
              )}
            </div>

            {/* Recent activation keys from database */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Recent Activation Keys from Database</h2>
              {isLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="space-y-3">
                  {activationKeys?.map((key) => (
                    <div 
                      key={key.id} 
                      className={`border rounded-lg p-4 ${
                        key.isActive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <code className="font-mono text-sm font-semibold">{key.activationKey}</code>
                          <div className="text-xs text-slate-600 mt-1">
                            Order ID: {key.orderId} | Created: {new Date(key.createdAt).toLocaleString()}
                            {key.usedAt && ` | Used: ${new Date(key.usedAt).toLocaleString()}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            key.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {key.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(key.activationKey)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clear localStorage button */}
            <div>
              <Button 
                variant="outline" 
                onClick={() => {
                  localStorage.removeItem('latestActivationKey');
                  window.location.reload();
                }}
              >
                Clear localStorage & Reload
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}