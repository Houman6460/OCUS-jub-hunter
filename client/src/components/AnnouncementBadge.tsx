import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Target, Star } from "lucide-react";

interface AnnouncementBadgeData {
  id: number;
  isEnabled: boolean;
  textEn: string;
  textTranslations: Record<string, string>;
  backgroundColor: string;
  textColor: string;
  priority: number;
}

export function AnnouncementBadge() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  // Fetch active announcement badge
  const { data: badge, isLoading } = useQuery<AnnouncementBadgeData>({
    queryKey: ['/api/announcement-badge/active'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/announcement-badge/active');
      return await response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Don't render if loading, no badge, or not enabled
  if (isLoading || !badge || !badge.isEnabled) {
    return null;
  }

  // Get localized text
  const getText = () => {
    if (language === 'en' || !badge.textTranslations?.[language]) {
      return badge.textEn;
    }
    return badge.textTranslations[language];
  };

  return (
    <div className={`mb-8 transition-all duration-1000 ${isVisible ? 'animate-slideIn' : 'opacity-0'}`}>
      <Badge className="bg-gradient-to-r from-primary to-accent border-primary/30 px-6 py-2 text-base font-semibold shadow-lg backdrop-blur-sm text-white">
        <Target className="w-5 h-5 mr-2 animate-pulse text-white" />
        {getText()}
        <Star className="w-5 h-5 ml-2 text-white animate-pulse delay-300" />
      </Badge>
    </div>
  );
}