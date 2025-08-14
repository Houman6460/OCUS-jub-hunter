import { Link, useLocation } from "wouter";
import { Chrome, Facebook, Twitter, Instagram } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const navigateToLegalSection = (section: string) => {
    setLocation('/legal');
    // Small delay to allow page to load before scrolling
    setTimeout(() => {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      // Update URL hash
      window.history.replaceState(null, '', `/legal#${section}`);
    }, 100);
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Chrome className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">OCUS Job Hunter</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              The ultimate Chrome extension for photographers on delivery platforms. Find photography jobs 10x faster.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">{t.features}</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">{t.downloadNow}</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Updates</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t.support}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/unified-login" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-white transition-colors">{t.submitTicket}</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t.contact}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li>
                <button 
                  onClick={() => navigateToLegalSection('privacy')}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                >
                  Privacy Terms
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToLegalSection('privacy')}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToLegalSection('refund')}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                >
                  Refund Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToLegalSection('terms')}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li><Link href="/legal" className="text-gray-400 hover:text-white transition-colors">Legal Information</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 OCUS Job Hunter. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-4 sm:mt-0">
            Made with ❤️ for photographers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}