import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, Globe } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HeaderProps {
  variant?: "default" | "compact";
}

export default function Header({ variant = "default" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const isLoginPage = location === "/login";
  const basketSize = variant === "compact" ? "h-4 w-4" : "h-5 w-5";

  const languageOptions = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'pt', label: 'Português', flag: '🇵🇹' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'da', label: 'Dansk', flag: '🇩🇰' },
    { value: 'no', label: 'Norsk', flag: '🇳🇴' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'fi', label: 'Suomi', flag: '🇫🇮' },
    { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center" aria-hidden="true">
              {/* Target icon SVG (concentric circles) */}
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <circle cx="50" cy="50" r="48" fill="#ffffff" />
                <circle cx="50" cy="50" r="40" fill="#2F6FB2" />
                <circle cx="50" cy="50" r="30" fill="#ffffff" />
                <circle cx="50" cy="50" r="22" fill="#2F6FB2" />
                <circle cx="50" cy="50" r="12" fill="#ffffff" />
                <circle cx="50" cy="50" r="6" fill="#2F6FB2" />
              </svg>
            </div>
            <span className="font-bold text-xl text-gray-900">OCUS Job Hunter</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              {t.home}
            </Link>
            <Link href="/support" className="text-gray-600 hover:text-gray-900 transition-colors">
              {t.support}
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              {t.about}
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              {t.contact}
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
              <SelectTrigger className="w-32 border-gray-300 bg-white">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {languageOptions.find(opt => opt.value === language)?.label}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.flag}</span>
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Cart Button */}
            <Button variant="outline" size="sm" className="relative">
              <ShoppingCart className={basketSize} />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>

            {/* Auth Button */}
            {!isLoginPage && (
              <Link href="/login">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  {t.sign_in}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="py-4 space-y-2">
              <Link
                href="/"
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.home}
              </Link>
              <Link
                href="/support"
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.support}
              </Link>
              <Link
                href="/about"
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.about}
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.contact}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}