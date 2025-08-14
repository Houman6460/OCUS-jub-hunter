import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/translations';
import { ChevronDown, Globe } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
    { code: 'pt' as Language, name: 'Português', flag: '🇵🇹' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
    { code: 'da' as Language, name: 'Dansk', flag: '🇩🇰' },
    { code: 'no' as Language, name: 'Norsk', flag: '🇳🇴' },
    { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fi' as Language, name: 'Suomi', flag: '🇫🇮' },
    { code: 'tr' as Language, name: 'Türkçe', flag: '🇹🇷' },
  ];
  
  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-white/90 hover:border-primary/40 transition-all duration-300"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLanguage?.flag} {currentLanguage?.name}</span>
        <span className="sm:hidden">{currentLanguage?.flag}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Language Menu */}
          <Card className="absolute top-full right-0 mt-2 z-50 w-48 shadow-xl border border-primary/20 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-2">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-auto py-3 hover:bg-primary/10 transition-all duration-200 ${
                    language === lang.code ? 'bg-primary/5 text-primary font-semibold' : ''
                  }`}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm">{lang.name}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}