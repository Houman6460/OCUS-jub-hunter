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
  const [isScrolled, setIsScrolled] = useState(false);

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
  const { data: banner, isLoading, isError } = useQuery<CountdownBannerData>({
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
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 1, // Only retry once to avoid delays
    initialData: testBanner, // Start with test banner immediately
  });

  const displayBanner = banner;

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

  // Add CSS custom property for banner height when banner is active
  useEffect(() => {
    const bannerHeight = isScrolled ? '56px' : '116px'; // Smaller height when scrolled
    if (displayBanner && displayBanner.isEnabled && !timeRemaining.isExpired && !isDismissed) {
      document.documentElement.style.setProperty('--banner-height', bannerHeight);
      document.body.classList.add('banner-active');
    } else {
      document.documentElement.style.setProperty('--banner-height', '0px');
      document.body.classList.remove('banner-active');
    }
    
    return () => {
      document.documentElement.style.setProperty('--banner-height', '0px');
      document.body.classList.remove('banner-active');
    };
  }, [displayBanner, timeRemaining.isExpired, isDismissed, isScrolled]);

  // Handle scroll detection for compact banner
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 200); // Transform after 200px scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  // Add loading check to prevent flash of disappearing banner
  if (
    isDismissed ||
    timeRemaining.isExpired ||
    (!isLoading && !displayBanner) ||
    (!isLoading && displayBanner && !displayBanner.isEnabled)
  ) {
    return null;
  }

  // Show loading state briefly to prevent flash
  if (isLoading && !displayBanner) {
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
    <div 
      className={`fixed left-0 right-0 ${backgroundClass} text-white shadow-lg animate-slideIn z-40 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'py-2 px-4 rounded-full mx-4' 
          : 'py-5 px-4'
      }`}
      style={{ 
        top: isScrolled ? '80px' : '64px', // Position below header when scrolled
        animationDelay: '0.5s',
        borderRadius: isScrolled ? '50px' : '0px'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" 
           style={{ borderRadius: isScrolled ? '50px' : '0px' }}></div>
      
      <div className={`max-w-7xl mx-auto relative z-10 transition-all duration-500 ${
        isScrolled ? 'max-w-4xl' : ''
      }`}>
        <div className={`flex items-center justify-between transition-all duration-500 ${
          isScrolled 
            ? 'gap-4' 
            : 'flex-col lg:flex-row gap-4'
        }`}>
          
          {/* Compact Layout for Scrolled State */}
          {isScrolled ? (
            <div className="flex items-center justify-between w-full">
              {/* Left Side - Compact Title and Timer */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold whitespace-nowrap">Limited offer</span>
                
                {/* Ultra Compact Timer */}
                <div className="flex items-center gap-1 bg-black/30 rounded-full px-3 py-1">
                  <Clock className="h-3 w-3" />
                  <div className="flex gap-1 text-xs font-mono font-bold">
                    <span>{String(timeRemaining.hours).padStart(2, '0')}h</span>
                    <span>{String(timeRemaining.minutes).padStart(2, '0')}m</span>
                    <span>{String(timeRemaining.seconds).padStart(2, '0')}s</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Price and CTA */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {displayBanner.originalPrice && (
                    <span className="text-xs opacity-60 line-through">
                      {formatPrice(displayBanner.originalPrice)}
                    </span>
                  )}
                  <span className="text-sm font-bold">{formatPrice(displayBanner.targetPrice)}</span>
                </div>
                
                <Button
                  onClick={scrollToPricing}
                  size="sm"
                  className="bg-white text-slate-900 hover:bg-white/90 font-semibold px-4 py-1 text-sm whitespace-nowrap rounded-full h-8"
                >
                  Get Now!
                </Button>

                {/* Compact Dismiss Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-6 w-6 p-0 rounded-full"
                  onClick={() => setIsDismissed(true)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Original Layout for Non-Scrolled State */}
              {/* Left Side - Title and Subtitle */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-lg lg:text-xl font-bold mb-1 animate-pulse">
                  {title}
                </h2>
                <p className="text-sm lg:text-base opacity-90">
                  {subtitle}
                </p>
              </div>

              {/* Center - Countdown Timer */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2">
                  <Clock className="w-4 h-4" />
                  <div className="flex items-center gap-1 text-sm font-mono">
                    {timeRemaining.days > 0 && (
                      <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
                        {timeRemaining.days}d
                      </span>
                    )}
                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
                      {String(timeRemaining.hours).padStart(2, '0')}h
                    </span>
                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
                      {String(timeRemaining.minutes).padStart(2, '0')}m
                    </span>
                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
                      {String(timeRemaining.seconds).padStart(2, '0')}s
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="text-center">
                  {displayBanner.originalPrice && (
                    <div className="text-xs opacity-75 line-through">
                      {formatPrice(displayBanner.originalPrice)}
                    </div>
                  )}
                  <div className="text-lg font-bold">
                    {formatPrice(displayBanner.targetPrice)}
                  </div>
                </div>
              </div>

              {/* Right Side - CTA and Close */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={scrollToPricing}
                  size="sm" 
                  className="bg-white text-slate-900 hover:bg-white/90 font-semibold px-6 shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Get Now!
                </Button>

                {/* Dismiss Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 ml-2"
                  onClick={() => setIsDismissed(true)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}