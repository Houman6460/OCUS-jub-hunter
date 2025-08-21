import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CountdownBannerData {
  id: number;
  isEnabled: boolean;
  titleEn: string;
  subtitleEn: string;
  titleTranslations: Record<string, string>;
  subtitleTranslations: Record<string, string>;
  targetPrice: string;
  originalPrice?: string;
  endDateTime: string;
  backgroundColor: string;
  textColor: string;
  priority: number;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function CountdownBanner() {
  const { language } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });
  const [isDismissed, setIsDismissed] = useState(false);

  // Create a test banner if no active banner is found
  const testBanner: CountdownBannerData = {
    id: 999,
    isEnabled: true,
    titleEn: "🔥 Limited Time Offer! 🔥",
    subtitleEn: "Get premium access at special pricing",
    titleTranslations: {},
    subtitleTranslations: {},
    targetPrice: "250",
    originalPrice: "500",
    endDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    backgroundColor: "gradient-primary",
    textColor: "white",
    priority: 1,
  };

  // Fetch active countdown banner
  const { data: banner } = useQuery<CountdownBannerData>({
    queryKey: ['/api/countdown-banner/active'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/countdown-banner/active');
        if (response.status === 404) {
          return testBanner; // Use test banner if no active banner found
        }
        return await response.json();
      } catch (error) {
        return testBanner; // Use test banner on error
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const displayBanner = banner || testBanner;

  // Calculate time remaining
  useEffect(() => {
    if (!displayBanner?.endDateTime) return;

    const calculateTimeRemaining = () => {
      const endTime = new Date(displayBanner.endDateTime).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [displayBanner?.endDateTime]);

  // Format price for display
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(price));
  };

  // Get localized text
  const getLocalizedText = (englishText: string, translations: Record<string, string>) => {
    return translations[language] || englishText;
  };

  // Scroll to pricing section
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Don't show banner if disabled, expired, or dismissed
  if (
    !displayBanner || 
    !displayBanner.isEnabled || 
    timeRemaining.isExpired || 
    isDismissed
  ) {
    return null;
  }

  const title = getLocalizedText(displayBanner.titleEn, displayBanner.titleTranslations);
  const subtitle = getLocalizedText(displayBanner.subtitleEn, displayBanner.subtitleTranslations);

  const backgroundClass = displayBanner.backgroundColor === 'gradient-primary' 
    ? 'bg-gradient-to-r from-primary via-blue-600 to-accent'
    : displayBanner.backgroundColor === 'gradient-urgent'
    ? 'bg-gradient-to-r from-red-600 to-red-500'
    : displayBanner.backgroundColor === 'gradient-success'
    ? 'bg-gradient-to-r from-green-600 to-green-500'
    : 'bg-gradient-to-r from-primary to-accent';

  return (
    <div className={`fixed top-16 left-0 right-0 z-40 ${backgroundClass} text-white shadow-lg animate-slideDown`}>
      <div className="max-w-7xl mx-auto px-4 py-3 relative">
        {/* Close button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close banner"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Banner content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold mb-1">{title}</h3>
            <p className="text-sm opacity-90">{subtitle}</p>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
              <Clock className="h-4 w-4" />
              <div className="flex gap-2 text-sm font-mono">
                <span>{timeRemaining.days}d</span>
                <span>{timeRemaining.hours.toString().padStart(2, '0')}h</span>
                <span>{timeRemaining.minutes.toString().padStart(2, '0')}m</span>
                <span>{timeRemaining.seconds.toString().padStart(2, '0')}s</span>
              </div>
            </div>

            {/* Price display */}
            {displayBanner.originalPrice && (
              <div className="text-right">
                <div className="text-xs opacity-75 line-through">
                  {formatPrice(displayBanner.originalPrice)}
                </div>
                <div className="text-lg font-bold">
                  {formatPrice(displayBanner.targetPrice)}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <Button
              onClick={scrollToPricing}
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-6"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}