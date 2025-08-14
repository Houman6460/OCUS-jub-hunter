import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useState, useEffect } from 'react';

export function GDPRNotice() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('gdpr-accepted');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const acceptGDPR = () => {
    localStorage.setItem('gdpr-accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-50 dark:bg-blue-900/90 border-t border-blue-200 dark:border-blue-800 p-4 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Cookie & Privacy Notice</p>
            <p>
              We use cookies to improve your experience and comply with GDPR regulations. 
              <Link href="/legal#privacy" className="underline hover:no-underline ml-1">
                Learn more about our privacy practices
              </Link>
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            onClick={acceptGDPR}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Accept
          </Button>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}