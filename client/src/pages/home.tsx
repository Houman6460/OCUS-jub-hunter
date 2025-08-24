import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ChatBot } from "@/components/ChatBot";
import { CardPrice } from "@/components/PriceDisplay";
import { CountdownBanner } from "@/components/CountdownBanner";
import { AnnouncementBadge } from "@/components/AnnouncementBadge";
import { 
  Bot, 
  Filter, 
  Bell, 
  Download, 
  ChartLine, 
  Shield, 
  Star, 
  Globe, 
  Play, 
  Check,
  ShoppingCart,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  BarChart3,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Menu,
  X
} from "lucide-react";
import './home.css';

export default function Home() {
  const { t } = useLanguage();
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({});
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState({ jobs: 0, earnings: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFAQ = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const scrollToPurchase = () => {
    const pricingSection = document.getElementById('pricing');
    pricingSection?.scrollIntoView({ behavior: 'smooth' });
  };

  // Animation for hero section and scroll detection
  useEffect(() => {
    setIsVisible(true);
    
    // Animate counter stats
    const interval = setInterval(() => {
      setCurrentStat(prev => ({
        jobs: prev.jobs < 239 ? prev.jobs + 3 : 239,
        earnings: prev.earnings < 8500 ? prev.earnings + 150 : 8500
      }));
    }, 50);

    // Scroll detection for floating button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Keyboard support for video modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showVideoPopup) {
        setShowVideoPopup(false);
      }
    };

    if (showVideoPopup) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [showVideoPopup]);

  const featuresIcons = [Bot, Shield, Bell, Filter, BarChart3, Clock];
  
  const features = (t?.featuresList || []).map((feature, index) => ({
    icon: featuresIcons[index],
    title: feature?.title || '',
    description: feature?.description || ''
  }));

  return (
    <div className="min-h-screen banner-active">
      <AnnouncementBadge />
      <CountdownBanner />
      <ChatBot />
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <span className="text-xl sm:text-2xl font-bold text-primary">OCUS Job Hunter</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-slate-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">{t?.features || 'Features'}</a>
                <a href="#tutorial" className="text-slate-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">{t?.installation || 'Installation'}</a>
                <a href="#pricing" className="text-slate-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">{t?.pricing || 'Pricing'}</a>
                <Link href="/privacy-policy" className="text-slate-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">Privacy</Link>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSelector />
              <Link href="/unified-login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Button onClick={scrollToPurchase} className="bg-primary hover:bg-primary/90">
                <ShoppingCart className="mr-2 h-4 w-4" />
                {t?.buyNow || 'Buy Now'}
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSelector />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 hover:text-primary p-2 rounded-md transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                <a 
                  href="#features" 
                  className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t?.features || 'Features'}
                </a>
                <a 
                  href="#tutorial" 
                  className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t?.installation || 'Installation'}
                </a>
                <a 
                  href="#pricing" 
                  className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t?.pricing || 'Pricing'}
                </a>
                <Link 
                  href="/privacy-policy" 
                  className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Privacy
                </Link>
                <div className="px-3 py-2 space-y-2">
                  <Link href="/unified-login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => {
                      scrollToPurchase();
                      setMobileMenuOpen(false);
                    }} 
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {t?.buyNow || 'Buy Now'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pb-24 overflow-hidden banner-aware-section">
        {/* Floating Icons from Screenshot */}
        <div className="floating-icon icon-1">
          <Target className="w-8 h-8 text-blue-500" />
        </div>
        <div className="floating-icon icon-2">
          <Star className="w-8 h-8 text-yellow-400" />
        </div>
        <div className="floating-icon icon-3">
          <Bell className="w-8 h-8 text-red-500" />
        </div>
        <div className="floating-icon icon-4">
          <TrendingUp className="w-8 h-8 text-green-500" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Announcement Badge */}
          <AnnouncementBadge />
          
          {/* Main Headline */}
          <h1 className={`text-3xl sm:text-5xl lg:text-7xl font-bold mb-8 leading-tight transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <span className="text-slate-900 block mb-2">{t?.heroTitle1 || 'Maximize Your'}</span>
            <span className="bg-gradient-to-r from-primary via-blue-600 to-accent bg-clip-text text-transparent animate-gradient text-4xl sm:text-6xl lg:text-8xl font-black">
              {t?.heroTitle2 || 'OCUS'}
            </span>
            <span className="text-slate-900 block mt-2 text-2xl sm:text-4xl lg:text-6xl">{t?.heroTitle3 || 'Photography Income'}</span>
          </h1>
          
          {/* Subtitle */}
          <p className={`text-lg sm:text-xl lg:text-2xl text-slate-600 mb-10 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {t?.heroSubtitle || 'Professional Chrome extension that automatically hunts for photography jobs on OCUS platform, helping you secure high-paying gigs faster than ever.'}
          </p>

          {/* Value Proposition */}
          <div className={`bg-white/70 backdrop-blur-sm rounded-2xl p-4 md:p-6 max-w-2xl mx-auto mb-10 shadow-xl border border-primary/10 transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 md:space-x-8 text-primary font-semibold">
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-green-600" />
                <span className="text-sm sm:text-base">{t?.oneTimePayment || 'One-Time Payment'}</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-green-600" />
                <span className="text-sm sm:text-base">{t?.lifetimeAccess || 'Lifetime Access'}</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-green-600" />
                <span className="text-sm sm:text-base">{t?.noMonthlyFees || 'No Monthly Fees'}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Animated Stats */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-primary/10 transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl lg:text-4xl font-black text-primary mb-2">{currentStat.jobs}+</div>
              <div className="text-xs lg:text-sm font-semibold text-slate-600 uppercase tracking-wide">{t?.jobsFound || 'Jobs Found'}</div>
              <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent mx-auto mt-3 rounded-full"></div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-accent/10 transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl lg:text-4xl font-black text-accent mb-2">€{currentStat.earnings}+</div>
              <div className="text-xs lg:text-sm font-semibold text-slate-600 uppercase tracking-wide">{t?.potentialEarnings || 'Potential Earnings'}</div>
              <div className="w-12 h-1 bg-gradient-to-r from-accent to-purple-500 mx-auto mt-3 rounded-full"></div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-green-500/10 transform hover:scale-105 transition-all duration-300">
              <div className="text-3xl lg:text-4xl font-black text-green-600 mb-2">24/7</div>
              <div className="text-xs lg:text-sm font-semibold text-slate-600 uppercase tracking-wide">{t?.activeMonitoring || 'Active Monitoring'}</div>
              <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mt-3 rounded-full"></div>
            </div>
          </div>
          
          {/* Call to Action Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Button 
              size="lg" 
              onClick={scrollToPurchase} 
              className="w-full sm:w-auto bg-gradient-to-r from-primary via-blue-600 to-accent hover:from-primary/90 hover:via-blue-600/90 hover:to-accent/90 text-lg lg:text-xl px-8 lg:px-12 py-4 lg:py-6 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl rounded-2xl font-bold border-2 border-white/20"
            >
              <ShoppingCart className="mr-2 lg:mr-3 h-5 lg:h-6 w-5 lg:w-6" />
              <span className="hidden sm:inline">{t?.buyNow || 'Get Extension Now'}</span>
              <span className="sm:hidden">{t?.buyNow || 'Buy Now'}</span>
              <Sparkles className="ml-2 lg:ml-3 h-5 lg:h-6 w-5 lg:w-6 animate-pulse" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto text-lg lg:text-xl px-8 lg:px-12 py-4 lg:py-6 hover:bg-primary/10 hover:text-primary border-3 border-primary/30 hover:border-primary/60 transform hover:scale-105 transition-all duration-300 rounded-2xl font-bold backdrop-blur-sm bg-white/40 text-slate-900"
            >
              <Play className="mr-2 lg:mr-3 h-5 lg:h-6 w-5 lg:w-6" />
              <span className="hidden sm:inline">{t?.watchDemo || 'Watch Demo'}</span>
              <span className="sm:hidden">{t?.watchDemo || 'Demo'}</span>
              <Globe className="ml-2 lg:ml-3 h-5 lg:h-6 w-5 lg:w-6" />
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className={`mt-8 lg:mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-slate-500 transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              <span className="font-medium">{t?.sslSecured || 'SSL Secured'}</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              <span className="font-medium">{t?.rating || '5.0 Rating'}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              <span className="font-medium">{t?.instantDownload || 'Instant Download'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* How JobHunter Works - 4-Stage Cards */}
      <section className="py-12 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
              Step by Step Process
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {t?.howJobHunterWorksTitle || 'How JobHunter Works'}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Transform your job hunting experience in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
            {(t?.howJobHunterWorksCards || [
              {
                title: "Sign Up for Free",
                description: "Create your free JobHunter account to get started. No commitment required."
              },
              {
                title: "Install the Chrome Extension",
                description: "Download our Chrome automation tool from your dashboard to start catching jobs automatically."
              },
              {
                title: "Try Free Automation",
                description: "Catch your first 3 local jobs automatically—free during trial mode."
              },
              {
                title: "Activate Full Access",
                description: "Unlock unlimited job catching forever with a one-time license—just the cost of 2 jobs."
              }
            ]).map((card, index) => (
              <div key={index} className="group relative">
                {/* Connection line for desktop */}
                {index < 3 && (
                  <div className="hidden xl:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-primary/30 to-transparent z-10 transform translate-x-0"></div>
                )}
                
                {/* Card */}
                <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-100 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:-translate-y-2 group-hover:border-primary/20 overflow-hidden animate-cardGlow h-full flex flex-col">
                  {/* Lighting effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Animated border glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl -z-10 transform scale-105 animate-borderGlow"></div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  </div>
                  
                  <div className="text-center relative z-10 flex-1 flex flex-col justify-between">
                    {/* Step number with enhanced design */}
                    <div className="relative mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent text-white rounded-2xl mb-2 text-xl font-bold shadow-lg group-hover:shadow-primary/30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        {index + 1}
                        {/* Inner glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                      </div>
                      
                      {/* Floating particles effect */}
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-particleFloat"></div>
                      <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 animate-particleFloat"></div>
                      <div className="absolute -top-1 -left-3 w-1.5 h-1.5 bg-primary/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200 animate-particleFloat"></div>
                    </div>
                    
                    {/* Title with gradient effect */}
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                      {card.title}
                    </h3>
                    
                    {/* Description with enhanced typography */}
                    <p className="text-slate-600 leading-relaxed text-base group-hover:text-slate-700 transition-colors duration-300 min-h-[4.5rem]">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Call to action */}
          <div className="text-center mt-16">
            <Link href="/login">
              <div className="inline-flex items-center gap-4 bg-gradient-to-r from-primary to-accent px-8 py-4 rounded-full text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 cursor-pointer group">
                <span>Get Started Today</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Demonstration */}
      <section className="py-20 bg-white banner-aware-additional-spacing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t?.problemTitle || 'The Photography Job Hunt Challenge'}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t?.problemSubtitle || 'Traditional job hunting methods are inefficient and time-consuming. Our extension automates the entire process.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center">
                  <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">✗</span>
                  {t?.manualJobHunting || 'Manual Job Hunting'}
                </h3>
                <ul className="text-red-800 space-y-2">
                  {(t?.manualJobHuntingProblems || ['Hours wasted checking job boards', 'Missing time-sensitive opportunities', 'Manual application processes', 'No automated filtering']).map((problem, index) => (
                    <li key={index}>• {problem}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">✓</span>
                  {t?.automatedSolution || 'OCUS Job Hunter Extension'}
                </h3>
                <ul className="text-green-800 space-y-2">
                  {(t?.automatedSolutionBenefits || ['Instant job notifications', '24/7 automated monitoring', 'Smart filtering & matching', 'One-click applications']).map((benefit, index) => (
                    <li key={index}>• {benefit}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Live Job Results Demo */}
            <div className="relative">
              <Card className="relative overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary to-accent text-white">
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5" />
                    ocus.com/jobs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {[
                      { title: "Ubereats Food Photography", location: "Downtown • €85/assignment" },
                      { title: "Foodora Restaurant Shoot", location: "City Center • €90/assignment" },
                      { title: "Delivery App Photos", location: "Near You • €80/assignment" }
                    ].map((job, i) => (
                      <div key={i} className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-900">{job.title}</h3>
                          <Badge className="bg-accent text-white">Auto-Found</Badge>
                        </div>
                        <p className="text-slate-600 text-sm">{job.location}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Badge className="bg-accent text-white">
                      <Check className="mr-1 h-3 w-3" />
                      43 photography gigs found automatically
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              {/* Floating stats */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">99%</div>
                  <div className="text-xs text-slate-500">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extension Interface Showcase */}
      <section className="py-20 bg-slate-50 banner-aware-additional-spacing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t?.extensionShowcaseTitle || 'Premium OCUS Job Hunter Extension'}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-4">
              {t?.extensionShowcaseSubtitle || 'Complete automation for OCUS photography jobs with intelligent monitoring and seamless workflow management'}
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 text-center">
                {t?.extensionHowItWorksTitle || '🎯 How the Premium Extension Works'}
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-blue-600 font-semibold mb-1">{t?.extensionAutoLoginTitle || '🔐 Auto-Login'}</div>
                  <p className="text-slate-600">{t?.extensionAutoLoginDescription || 'Uses your OCUS credentials to automatically log you back in when sessions expire'}</p>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-semibold mb-1">{t?.extension24MonitoringTitle || '🕐 24/7 Monitoring'}</div>
                  <p className="text-slate-600">{t?.extension24MonitoringDescription || 'After accepting missions, returns to home page to continue monitoring for new opportunities'}</p>
                </div>
                <div className="text-center">
                  <div className="text-purple-600 font-semibold mb-1">{t?.extensionSmartTimerTitle || '⚡ Smart Timer'}</div>
                  <p className="text-slate-600">{t?.extensionSmartTimerDescription || 'Customizable refresh intervals (5-30 seconds) with floating panel controls and performance tracking'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Extension Panels - 2 Panels Side by Side */}
          <div className="mb-16">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-start">
              
              {/* Floating OCUS Hunter Panel - Exact Match */}
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-bold text-slate-900 text-center mb-4">{t?.floatingPanelTitle || 'Floating OCUS Hunter Panel'}</h3>
                <div className="flex justify-center flex-1 system-font">
                  {/* Exact Panel Design from Extension Code */}
                  <div className="floating-panel">
                    {/* Header */}
                    <div className="panel-header">
                      <h1 className="extension-title">
                        <span className="panel-icon">🎯</span>
                        OCUS Unified Extension
                      </h1>
                      <span className="premium-badge-header">Premium</span>
                    </div>
                    
                    {/* Body */}
                    <div className="panel-body">
                      {/* Timer Section */}
                      <div className="timer-section">
                        {/* Timer Display */}
                        <div className="timer-display">
                          <div className="timer-value-container">
                            <span>4</span>
                            <span className="timer-unit">sec</span>
                          </div>
                          <div className="timer-label">
                            Next Refresh
                          </div>
                        </div>
                        
                        {/* Interval Quick Select */}
                        <div>
                          <div className="interval-label">
                            Refresh Interval
                          </div>
                          <div className="interval-buttons-container">
                            <button className="interval-button active">5s</button>
                            <button className="interval-button">10s</button>
                            <button className="interval-button">20s</button>
                            <button className="interval-button">30s</button>
                          </div>
                        </div>
                        
                        {/* Timer Controls */}
                        <div className="timer-controls">
                          <button className="timer-control-button primary">
                            <span className="timer-control-icon">⏸</span>
                            <span className="timer-control-text">Pause</span>
                          </button>
                          <button className="timer-control-button secondary">
                            <span className="timer-control-icon">🔄</span>
                            <span className="timer-control-text">Refresh</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Stats Section */}
                      <div>
                        <div className="stats-grid">
                          <div className="stat-item">
                            <span className="stat-value">∞</span>
                            <span className="stat-label">Unlimited</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">2295</span>
                            <span className="stat-label">Refreshing</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">444</span>
                            <span className="stat-label">Opened</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">444</span>
                            <span className="stat-label">Accepted</span>
                          </div>
                        </div>
                        
                        {/* Bottom single stat - LOGINS */}
                        <div className="stats-grid-single">
                          <div className="stat-item">
                            <span className="stat-value">95</span>
                            <span className="stat-label">Logins</span>
                          </div>
                          <div></div>
                        </div>
                      </div>
                      
                      {/* Status Message */}
                      <div className="status-message">
                        Ready
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-blue-900 mb-2 text-sm">Always-Visible Floating Panel</h4>
                  <p className="text-blue-800 text-xs leading-relaxed">
                    {t?.floatingPanelDescription || 'This dark-themed floating panel stays visible while browsing OCUS. Shows real-time countdown timer with customizable refresh intervals. Premium users get unlimited access with detailed tracking metrics for missions found, opened, accepted, and login attempts.'}
                  </p>
                </div>
              </div>

              {/* Extension Popup - Exact Match */}
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-bold text-slate-900 text-center mb-4">{t?.extensionPopupTitle || 'Extension Popup Interface'}</h3>
                <div className="flex justify-center flex-1 font-apple-system">
                  {/* Exact Popup Design from popup.html - Same Height as Floating Panel */}
                  <div className="extension-popup-container">
                    {/* Header - Compact */}
                    <div className="extension-header">
                      <h1 className="extension-title">
                        <span className="icon-font-size-18">🎯</span>
                        OCUS Unified Extension
                      </h1>
                      <span className="premium-badge-header">Premium</span>
                    </div>
                    
                    {/* Body */}
                    <div className="extension-body">
                      {/* Premium Status Section - Compact */}
                      <div className="config-section">
                        <div className="config-header">
                          <span>Premium Status</span>
                          <span className="premium-badge-status">Premium</span>
                        </div>
                        <div className="premium-status-body">
                          <div className="premium-status-banner">
                            <p className="premium-banner-title">✅ Premium Version Active</p>
                            <p className="premium-banner-text">Enjoy unlimited mission acceptance!</p>
                          </div>
                          <div className="premium-details">
                            <div className="premium-detail-row">
                              <span className="premium-detail-label">Status:</span>
                              <span className="premium-detail-value-status">✓ Premium</span>
                            </div>
                            <div className="premium-detail-row">
                              <span className="premium-detail-label">Usage:</span>
                              <span className="premium-detail-value">Unlimited</span>
                            </div>
                            <div className="flex-justify-between">
                              <span className="premium-detail-label">Version:</span>
                              <span>2.1.0-PREMIUM</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Auto Login Section - Compact */}
                      <div className="config-section">
                        <div className="config-header">
                          <span>Auto Login Configuration</span>
                          <div className="toggle-switch">
                            <div className="toggle-switch-background">
                              <div className="toggle-switch-slider"></div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="margin-bottom-8">
                            <label className="input-label">OCUS Username</label>
                            <input 
                              type="text" 
                              className="extension-input"
                              value="photographer@example.com"
                              readOnly
                              title="OCUS Username"
                              placeholder="Enter your OCUS username"
                              aria-label="OCUS Username"
                            />
                          </div>
                          <div>
                            <label className="input-label">OCUS Password</label>
                            <input 
                              type="password" 
                              className="extension-input"
                              title="OCUS Password"
                              placeholder="Enter your OCUS password"
                              aria-label="OCUS Password"
                              value="••••••••"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mission Monitor Section - Compact */}
                      <div className="config-section">
                        <div className="config-header">
                          <span>Mission Monitor Configuration</span>
                          <div className="toggle-switch">
                            <div className="toggle-switch-background">
                              <div className="toggle-switch-slider"></div>
                            </div>
                          </div>
                        </div>
                        <div className="extension-panel-settings">
                          <div className="extension-input-group">
                            <label className="extension-input-label">Refresh Interval (sec)</label>
                            <input 
                              type="number" 
                              className="extension-input"
                              value="30"
                              readOnly
                              title="Refresh Interval (seconds)"
                              placeholder="Enter refresh interval"
                              aria-label="Refresh Interval in seconds"
                            />
                          </div>
                          <div className="extension-settings-row">
                            <label className="extension-label">Show Notifications</label>
                            <div className="extension-toggle-container">
                              <div className="extension-toggle-background">
                                <div className="extension-toggle-slider"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mission Acceptor Section - Compact */}
                      <div className="config-section">
                        <div className="config-header">
                          <span>Mission Acceptor Configuration</span>
                          <div className="toggle-switch">
                            <div className="toggle-switch-background">
                              <div className="toggle-switch-slider"></div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="settings-row">
                            <label className="settings-label-small">Auto Close Tab After Accept</label>
                            <div className="toggle-switch-small">
                              <div className="toggle-switch-small-bg">
                                <div className="toggle-switch-small-slider"></div>
                              </div>
                            </div>
                          </div>
                          <div className="margin-bottom-8">
                            <label className="input-label">Close Delay (sec)</label>
                            <input 
                              type="number" 
                              className="extension-input"
                              value="2"
                              readOnly
                              title="Close Delay (seconds)"
                              placeholder="Enter close delay"
                              aria-label="Close Delay in seconds"
                            />
                          </div>
                          <div className="flex-justify-between-items-center">
                            <label className="settings-label-small">Play Success Sound</label>
                            <div className="toggle-switch-small">
                              <div className="toggle-switch-small-bg">
                                <div className="toggle-switch-small-slider"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Page Refresh Timer Section - Compact */}
                      <div className="config-section">
                        <div className="config-header">
                          <span>Page Refresh Timer</span>
                          <div className="toggle-switch">
                            <div className="toggle-switch-background">
                              <div className="toggle-switch-slider"></div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="margin-bottom-8">
                            <label className="input-label">Refresh Interval</label>
                            <div className="flex-gap-3-mb-6">
                              <button className="quick-set-button active">5s</button>
                              <button className="quick-set-button">10s</button>
                              <button className="quick-set-button">20s</button>
                              <button className="quick-set-button">30s</button>
                            </div>
                            <div className="flex-mb-6">
                              <input 
                                type="number" 
                                className="extension-input-small"
                                value="5"
                                readOnly
                                title="Custom refresh interval"
                                placeholder="Enter seconds"
                                aria-label="Custom refresh interval in seconds"
                              />
                              <button className="set-button-small">Set</button>
                            </div>
                          </div>
                          <div className="flex-justify-between-items-center">
                            <label className="settings-label-small">Show Countdown Panel</label>
                            <div className="toggle-switch-small">
                              <div className="toggle-switch-small-bg">
                                <div className="toggle-switch-small-slider"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Statistics Section - Compact */}
                      <div className="config-section">
                        <div className="config-header">
                          <span>Statistics</span>
                          <button className="reset-button-small">Reset</button>
                        </div>
                        <div className="stats-container-dark">
                          <div className="stat-row-dark">
                            <span className="premium-detail-label">Missions Refreshing:</span>
                            <span className="stat-value-dark">2295</span>
                          </div>
                          <div className="stat-row-dark">
                            <span className="premium-detail-label">Missions Opened:</span>
                            <span className="stat-value-dark">444</span>
                          </div>
                          <div className="stat-row-dark">
                            <span className="premium-detail-label">Missions Accepted:</span>
                            <span className="stat-value-dark">444</span>
                          </div>
                          <div className="stat-row-dark">
                            <span className="premium-detail-label">Login Attempts:</span>
                            <span className="stat-value-dark">95</span>
                          </div>
                          <div className="stat-row-dark">
                            <span className="premium-detail-label">Successful Logins:</span>
                            <span className="stat-value-dark">95</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Buttons - Compact */}
                      <div className="action-buttons-container">
                        <button className="action-button save-button">Save Configuration</button>
                        <button className="action-button stop-button">Emergency Stop</button>
                      </div>

                      {/* Footer Note */}
                      <div className="footer-note-small">
                        Press Alt+E on any OCUS page to access emergency controls
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-green-900 mb-2 text-sm">Extension Popup Interface</h4>
                  <p className="text-green-800 text-xs leading-relaxed">
                    {t?.extensionPopupDescription || 'Click the browser extension icon to access this full control panel. Configure auto-login with your OCUS credentials, manage all extension settings, and monitor premium status. Dark-themed interface with comprehensive configuration options.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Explanation */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">{t?.howItWorksTitle || 'How the Premium Extension Works'}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <Shield className="h-5 w-5 text-blue-500 mr-2" />
                  {t?.autoLoginTitle || 'Auto-Login System'}
                </h4>
                <p className="text-slate-600 text-sm">
                  {t?.autoLoginDescription || 'Automatically logs you back in with your OCUS credentials when sessions expire. Never miss photography jobs due to unexpected logouts - the extension handles authentication seamlessly.'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <Clock className="h-5 w-5 text-green-500 mr-2" />
                  {t?.monitoringTitle || '24/7 Smart Monitoring'}
                </h4>
                <p className="text-slate-600 text-sm">
                  {t?.monitoringDescription || 'After accepting a mission, automatically returns to home page to continue monitoring. Customizable refresh intervals (5-30 seconds) ensure you never miss new Ubereats and Foodora photography opportunities.'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <Bell className="h-5 w-5 text-yellow-500 mr-2" />
                  {t?.timerTitle || 'Smart Timer Settings'}
                </h4>
                <p className="text-slate-600 text-sm">
                  {t?.timerDescription || 'Configurable refresh timer with floating panel display. Set your preferred monitoring intervals and track performance with real-time statistics. Pause, resume, or refresh immediately as needed.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Demo Download Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-100 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6 border border-green-200 shadow-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
              {t?.freeDemoBadge || "100% Free Trial"}
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {t?.freeDemoTitle || "Try the Demo Version for Free"}
            </h2>
            <p className="text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-8">
              {t?.freeDemoSubtitle || "Test our extension with 3 free missions before upgrading to unlimited access"}
            </p>
            <p className="text-lg text-green-700 font-medium">
              {t?.freeDemoTestText || "Perfect for testing before purchase"}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Features */}
            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-green-100 transform hover:scale-105 transition-all duration-300">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-3">✓</span>
                  Demo Features Included
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700 font-medium">{t?.freeDemoFeature1 || "3 Free Mission Tests"}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700 font-medium">{t?.freeDemoFeature2 || "Full Extension Features"}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700 font-medium">{t?.freeDemoFeature3 || "No Credit Card Required"}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700 font-medium">{t?.freeDemoFeature4 || "Instant Download"}</span>
                  </div>
                </div>
              </div>

              {/* Upgrade CTA */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-white shadow-xl">
                <h4 className="text-xl font-bold mb-3">{t?.freeDemoUpgradeText || "Love it? Upgrade to unlimited access anytime"}</h4>
                <Button 
                  onClick={scrollToPurchase}
                  className="bg-white text-green-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <Star className="mr-2 h-5 w-5" />
                  Upgrade to Premium
                </Button>
              </div>
            </div>

            {/* Right side - Download CTA */}
            <div className="text-center lg:text-left">
              <div className="bg-white rounded-3xl p-12 shadow-2xl border border-green-100 transform hover:scale-105 transition-all duration-500">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-6 shadow-lg">
                    <Download className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">Ready to Try?</h3>
                  <p className="text-lg text-slate-600 mb-8">Download your free demo version now and start testing in minutes</p>
                </div>

                <div className="space-y-4">
                  <a 
                    href="/api/download-extension/trial"
                    download
                    className="block"
                  >
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xl px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-bold"
                    >
                      <Download className="mr-3 h-6 w-6" />
                      {t?.freeDemoDownloadButton || "Download Free Demo"}
                      <Sparkles className="ml-3 h-6 w-6 animate-pulse" />
                    </Button>
                  </a>
                  
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Safe & Secure Download</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span>2-minute setup time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom testimonial/trust section */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-8 bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-green-100">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-slate-700">5.0 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-slate-700">100% Safe</span>
              </div>
              <div className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-slate-700">1000+ Downloads</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Tutorial Section */}
      <section id="tutorial" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              How to Install the Chrome Extension
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Follow these simple steps to install the OCUS Job Hunter extension on your Chrome browser
            </p>
          </div>

          {/* Video Tutorial */}
          <div className="mb-16 text-center">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Video Tutorial</h3>
              <div 
                className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden aspect-video mb-6 cursor-pointer group transform hover:scale-[1.02] transition-all duration-500 hover:shadow-2xl border border-slate-700"
                onClick={() => setShowVideoPopup(true)}
              >
                {/* Dynamic Background */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-600/20 to-accent/30"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                </div>
                
                {/* Animated Mesh Background */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="mesh1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <path d="M0,100 Q100,50 200,100 T400,100 L400,300 L0,300 Z" fill="url(#mesh1)" className="animate-pulse" />
                  </svg>
                </div>
                
                {/* Floating UI Elements */}
                <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 animate-float">
                  <Bot className="w-5 h-5 text-white/80" />
                </div>
                <div className="absolute top-12 right-16 bg-primary/20 backdrop-blur-sm rounded-full p-2 border border-primary/30 animate-pulse delay-500">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div className="absolute bottom-24 left-12 bg-accent/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-accent/30 animate-bounce delay-1000">
                  <span className="text-xs text-white/90 font-medium">Tutorial</span>
                </div>
                
                {/* Main Chrome Extension Visual */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 shadow-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-md flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-white/90">
                        <div className="text-sm font-semibold">OCUS Job Hunter</div>
                        <div className="text-xs opacity-75">Chrome Extension</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Central Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 bg-white/10 rounded-full animate-ping scale-150"></div>
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping delay-300 scale-125"></div>
                    
                    {/* Main Play Button */}
                    <div className="relative bg-gradient-to-br from-white via-white to-white/95 rounded-full p-8 group-hover:scale-110 transition-all duration-500 shadow-2xl border-4 border-white/30 backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
                      <Play className="h-16 w-16 text-primary ml-2 relative z-10 drop-shadow-lg" fill="currentColor" />
                    </div>
                    
                    {/* Floating Icons Around Play Button */}
                    <div className="absolute -top-8 -left-8 bg-primary/20 backdrop-blur-sm rounded-full p-2 animate-bounce delay-200">
                      <Download className="w-4 h-4 text-primary" />
                    </div>
                    <div className="absolute -top-6 -right-10 bg-accent/20 backdrop-blur-sm rounded-full p-2 animate-bounce delay-700">
                      <ChartLine className="w-4 h-4 text-accent" />
                    </div>
                    <div className="absolute -bottom-8 -right-6 bg-green-500/20 backdrop-blur-sm rounded-full p-2 animate-bounce delay-1000">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Click to Play Indicator */}
                <div className="absolute top-6 right-6">
                  <div className="bg-black/60 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm flex items-center group-hover:bg-primary/80 transition-all duration-300 border border-white/20">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                    <Play className="w-3 h-3 mr-2" fill="currentColor" />
                    <span className="font-medium">Watch Tutorial</span>
                  </div>
                </div>
                
                {/* Video Info Overlay with Better Design */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8">
                  <div className="text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">Installation Tutorial</h4>
                        <p className="text-base opacity-90 mb-3 max-w-md">Complete step-by-step guide to install and configure the OCUS Job Hunter Chrome extension</p>
                      </div>
                      <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                        Premium Tutorial
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                          <Clock className="w-4 h-4 mr-2 text-blue-400" />
                          <span>3:45 minutes</span>
                        </div>
                        <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                          <Globe className="w-4 h-4 mr-2 text-green-400" />
                          <span>4K Quality</span>
                        </div>
                        <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                          <Star className="w-4 h-4 mr-2 text-yellow-400" />
                          <span>4.9/5 Rating</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center text-xs bg-green-600/90 backdrop-blur-sm px-3 py-1 rounded-full border border-green-400/30">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          <span>Ready to Watch</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Animated Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/60 transition-all duration-500"></div>
                
                {/* Advanced Shimmer Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-2xl"></div>
                </div>
                
                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/30 rounded-tl-lg group-hover:border-primary/60 transition-colors duration-300"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/30 rounded-br-lg group-hover:border-accent/60 transition-colors duration-300"></div>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed">
                🎬 Click the stunning video cover above to watch our premium installation tutorial. See exactly how to install and configure the OCUS Job Hunter extension with crystal-clear 4K visuals and professional narration.
              </p>
              <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-slate-500">
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>4.9/5 rating from 200+ users</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-blue-500" />
                  <span>Quick 3-minute tutorial</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-1 text-green-500" />
                  <span>No prior experience needed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">{t?.installationTitle || 'Installation Guide'}</h3>
              
              {/* Dynamic Installation Steps */}
              {(t?.installationSteps || [
                'Download the extension file',
                'Open your browser\'s extension settings',
                'Enable Developer Mode',
                'Click \'Load unpacked\' and select the downloaded folder',
                'Pin the extension to your toolbar',
                'Start finding photography jobs!'
              ]).map((step, index) => {
                const colors = ['blue', 'green', 'yellow', 'purple', 'red', 'indigo'];
                const color = colors[index % colors.length];
                return (
                  <div key={index} className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}>
                    <div className="flex items-start">
                      <div className={`bg-${color}-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 mt-1`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">{step}</h4>
                        <p className="text-slate-600 text-sm">
                          {index === 0 && "After purchase, you'll receive a download link for the OCUS-Job-Hunter.crx file"}
                          {index === 1 && "Navigate to Chrome's extension management page"}
                          {index === 2 && "Turn on Developer mode in the top-right corner of the Extensions page"}
                          {index === 3 && "Drag and drop the .crx file onto the Chrome Extensions page"}
                          {index === 4 && "Click the extension icon and enter your OCUS username and password"}
                          {index === 5 && "Adjust the refresh interval and enable notifications to start automatic job monitoring"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visual Guide */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Visual Reference</h3>
              
              {/* Chrome Extensions Screenshot */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="font-semibold text-slate-900 mb-4">Chrome Extensions Page</h4>
                <div className="bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-600">
                    <div className="mb-4">
                      <div className="inline-block bg-white rounded p-3 shadow-sm border">
                        <span className="text-sm font-mono">chrome://extensions/</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="bg-blue-50 rounded p-2">Developer mode: ON</div>
                      <div className="bg-green-50 rounded p-2">Drop .crx file here</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success State */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="font-semibold text-slate-900 mb-4">Installation Complete</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">OCUS Job Hunter Installed</span>
                  </div>
                  <div className="space-y-2 text-sm text-green-800">
                    <div>• Extension icon appears in Chrome toolbar</div>
                    <div>• Click the icon to open the control panel</div>
                    <div>• Configure your OCUS credentials</div>
                    <div>• Start monitoring for photography jobs!</div>
                  </div>
                </div>
              </div>

              {/* Troubleshooting */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="font-semibold text-slate-900 mb-4">Need Help?</h4>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start">
                    <div className="bg-red-100 rounded-full p-1 mr-3 mt-0.5">
                      <span className="text-red-600 text-xs">!</span>
                    </div>
                    <div>
                      <span className="font-medium">Installation blocked?</span> Make sure Developer mode is enabled
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-yellow-100 rounded-full p-1 mr-3 mt-0.5">
                      <span className="text-yellow-600 text-xs">?</span>
                    </div>
                    <div>
                      <span className="font-medium">Can't find the file?</span> Check your Downloads folder
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 text-blue-500 mr-3 mt-0.5" />
                    <div>
                      <span className="font-medium">Still having issues?</span> Contact support@ocusjobhunter.com
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start After Installation */}
          <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Quick Start Guide</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">1. Configure Credentials</h4>
                <p className="text-slate-600 text-sm">
                  Click the extension icon and enter your OCUS username and password in the Auto Login section
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">2. Set Monitoring</h4>
                <p className="text-slate-600 text-sm">
                  Adjust the refresh interval and enable notifications to start automatic job monitoring
                </p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">3. Start Hunting</h4>
                <p className="text-slate-600 text-sm">
                  Navigate to OCUS and let the extension automatically find Ubereats and Foodora photography jobs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t?.featuresTitle || 'Why Choose OCUS Photography Job Hunter?'}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t?.featuresSubtitle || 'This Google Chrome Extension is specifically designed for photographers working with Ubereats and Foodora through OCUS'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-2xl mx-auto features-grid">
            {features.map((feature, i) => (
              <Card
                key={i}
                className={`feature-card text-center p-6 md:p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group cursor-pointer border-2 border-transparent hover:border-primary/20 ${isVisible ? 'animate-fadeInUp-delayed' : 'opacity-0'}`}
              >
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 text-primary rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                  <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t?.faqTitle || 'Frequently Asked Questions'}
            </h2>
            <p className="text-xl text-slate-600">
              {t?.faqSubtitle || 'Everything you need to know about the OCUS Job Hunter Chrome Extension'}
            </p>
          </div>

          <div className="space-y-6">
            {(t?.faqQuestions || [
              'How does the OCUS Job Hunter extension work?',
              'Is the extension safe to use?',
              'What browsers are supported?',
              'How much can I earn using this extension?',
              'Can I try the extension before purchasing?',
              'Is there customer support available?'
            ]).map((question, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-6 text-left hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors">
                      {question}
                    </h3>
                    <ChevronDown 
                      className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${
                        faqOpen[index] ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                
                {faqOpen[index] && (
                  <div className="px-6 pb-6 border-t border-slate-100">
                    <div className="pt-4 text-slate-600 leading-relaxed animate-fadeInUp">
                      {(t?.faqAnswers || [
                        'Our extension automatically monitors OCUS job boards and sends you instant notifications when matching photography assignments become available.',
                        'Yes, our extension is completely safe. It only reads public job postings and doesn\'t access any personal information.',
                        'Currently supports Chrome and all Chromium-based browsers like Edge, Brave, and Opera.',
                        'Earnings vary by location and availability, but users typically see 200-400% more job opportunities compared to manual searching.',
                        'Yes, we offer a free trial so you can test it before purchasing. Experience the full functionality and see the results for yourself.',
                        'Yes, we provide 24/7 customer support via email and chat for all license holders.'
                      ])[index]}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-4">{t?.stillHaveQuestions || 'Still have questions?'}</h3>
              <p className="text-slate-600 mb-6">
                {t?.supportDescription || 'Our support team is here to help you get the most out of your OCUS Job Hunter extension.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:info@logoland.se"
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {t?.emailSupport || 'Email Support'}
                </a>
                <button
                  onClick={() => {
                    // Find and trigger the ChatBot button
                    const chatButtons = document.querySelectorAll('button');
                    Array.from(chatButtons).forEach(btn => {
                      if (btn.className.includes('rounded-full') && btn.className.includes('gradient') && btn.querySelector('svg')) {
                        btn.click();
                        return;
                      }
                    });
                  }}
                  className="inline-flex items-center px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t?.liveChat || 'Live Chat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50 relative overflow-hidden">
        {/* Floating Icons Background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top left area */}
          <div className="absolute top-20 left-8 lg:left-20 opacity-20 animate-bounce animate-delay animate-duration pricing-floating-icon-1">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="absolute top-32 left-16 lg:left-32 opacity-15 animate-bounce animate-delay animate-duration pricing-floating-icon-2">
            <Star className="w-6 h-6 text-accent" />
          </div>
          
          {/* Top right area */}
          <div className="absolute top-16 right-8 lg:right-20 opacity-20 animate-bounce animate-delay animate-duration pricing-floating-icon-3">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          <div className="absolute top-40 right-20 lg:right-40 opacity-15 animate-bounce animate-delay animate-duration pricing-floating-icon-4">
            <Target className="w-5 h-5 text-accent" />
          </div>
          
          {/* Bottom left area */}
          <div className="absolute bottom-32 left-12 lg:left-24 opacity-20 animate-bounce animate-delay animate-duration pricing-floating-icon-5">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <div className="absolute bottom-16 left-8 lg:left-16 opacity-15 animate-bounce animate-delay animate-duration pricing-floating-icon-6">
            <Globe className="w-6 h-6 text-accent" />
          </div>
          
          {/* Bottom right area */}
          <div className="absolute bottom-24 right-12 lg:right-28 opacity-20 animate-bounce animate-delay animate-duration pricing-floating-icon-7">
            <BarChart3 className="w-7 h-7 text-primary" />
          </div>
          <div className="absolute bottom-40 right-8 lg:right-16 opacity-15 animate-bounce animate-delay animate-duration pricing-floating-icon-8">
            <Clock className="w-5 h-5 text-accent" />
          </div>
          
          {/* Mid-level floating icons */}
          <div className="absolute top-1/2 left-4 lg:left-8 opacity-10 animate-bounce animate-delay animate-duration pricing-floating-icon-9">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div className="absolute top-1/3 right-4 lg:right-8 opacity-10 animate-bounce animate-delay animate-duration pricing-floating-icon-10">
            <Check className="w-6 h-6 text-accent" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t?.pricingTitle || 'Choose Your Plan'}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t?.pricingSubtitle || 'Start maximizing your photography income today with our powerful automation tools'}
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="relative overflow-hidden border-2 border-primary transform hover:scale-105 transition-all duration-500 hover:shadow-2xl group">
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-accent text-white text-center py-2 animate-shimmer">
                <span className="font-semibold flex items-center justify-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  MOST POPULAR
                  <Sparkles className="w-4 h-4 ml-2" />
                </span>
              </div>
              <CardHeader className="text-center pt-12 group-hover:bg-gradient-to-br group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-300">
                <CardTitle className="text-3xl font-bold text-slate-900 group-hover:text-primary transition-colors duration-300">OCUS Job Hunter</CardTitle>
                <div className="mt-4 flex flex-col items-center">
                  <CardPrice className="justify-center" />
                  <span className="text-slate-600 ml-2 text-sm mt-1">one-time</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>{t?.chromeExtensionFile || 'Chrome Extension (.crx file)'}</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>{t?.autoLoginOcus || 'Auto-login for OCUS account'}</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>{t?.jobMonitoringSystem || '24/7 job monitoring system'}</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>{t?.desktopNotifications || 'Instant desktop notifications'}</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>{t?.performanceAnalytics || 'Performance analytics & statistics'}</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>{t?.installationManual || 'Installation manual included'}</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>{t?.lifetimeUpdatesSupport || 'Lifetime access'}</span>
                </div>
                <div className="pt-6">
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg py-4 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group">
                      <ShoppingCart className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                      {t?.getExtension || 'Get Extension Now'}
                      <Zap className="ml-2 h-4 w-4 group-hover:animate-pulse" />
                    </Button>
                  </Link>
                </div>
                <div className="text-center text-sm text-slate-500 pt-2 space-y-1">
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>{t?.securePayment || 'Secure payment via Stripe & PayPal'}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>{t?.instantDigitalDelivery || 'Instant digital delivery'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2 group">
              <div className="flex items-center mb-4">
                <Bot className="w-8 h-8 text-primary mr-2 group-hover:animate-bounce" />
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">OCUS Job Hunter</span>
              </div>
              <p className="text-slate-400 mb-4 leading-relaxed">
                The ultimate Chrome extension for OCUS photographers. Automate your job search for Ubereats and Foodora photography assignments.
              </p>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span>Active Users: 150+</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  <span>Jobs Found: 2,400+</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                © 2024 OCUS Job Hunter. All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                Support
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:info@logoland.se" className="hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center group">
                    <Mail className="h-4 w-4 mr-2 group-hover:text-primary" />
                    Email Support
                  </a>
                </li>
                <li>
                  <Link href="/unified-login" className="hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center group">
                    <MessageCircle className="h-4 w-4 mr-2 group-hover:text-primary" />
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-primary" />
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => {
                      window.location.href = '/legal#privacy';
                    }}
                    className="hover:text-white hover:translate-x-1 transition-all duration-300 text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      window.location.href = '/legal#terms';
                    }}
                    className="hover:text-white hover:translate-x-1 transition-all duration-300 text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      window.location.href = '/legal#refund';
                    }}
                    className="hover:text-white hover:translate-x-1 transition-all duration-300 text-left"
                  >
                    Refund Policy
                  </button>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center group">
                    <Shield className="h-4 w-4 mr-2 group-hover:text-primary" />
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Back to top button */}
          <div className="mt-12 pt-8 border-t border-slate-700 text-center">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-primary/20 rounded-full text-white hover:text-primary transition-all duration-300 group"
            >
              <span className="mr-2">Back to Top</span>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full group-hover:animate-spin"></div>
            </button>
          </div>
        </div>
      </footer>

      {/* Enhanced Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 flex flex-col gap-2 md:gap-3 z-50">
        {/* Scroll to Top */}
        {showScrollTop && (
          <div className="relative group">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group animate-fadeInUp backdrop-blur-sm"
              aria-label="Scroll to top"
            >
              <ChevronUp className="w-4 h-4 md:w-5 md:h-5 group-hover:animate-bounce" />
            </button>
            {/* Tooltip */}
            <div className="absolute right-full mr-2 md:mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden md:block">
              Back to top
            </div>
          </div>
        )}
        
        {/* Quick Purchase */}
        <div className="relative group">
          <button
            onClick={scrollToPurchase}
            className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group backdrop-blur-sm"
            aria-label="Quick purchase"
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 group-hover:animate-bounce" />
          </button>
          {/* Tooltip */}
          <div className="absolute right-full mr-2 md:mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden md:block">
            Quick purchase
          </div>
        </div>

        {/* Watch Demo Video */}
        <div className="relative group">
          <button
            onClick={() => setShowVideoPopup(true)}
            className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group backdrop-blur-sm"
            aria-label="Watch demo video"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5 group-hover:animate-bounce" />
          </button>
          {/* Tooltip */}
          <div className="absolute right-full mr-2 md:mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden md:block">
            Watch demo
          </div>
        </div>
      </div>

      {/* Video Popup Modal */}
      {showVideoPopup && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeInUp"
          onClick={() => setShowVideoPopup(false)}
        >
          <div 
            className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform scale-100 hover:scale-[1.01] transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Chrome Extension Installation Tutorial</h3>
                <p className="text-slate-600 text-sm">Step-by-step guide to install OCUS Job Hunter</p>
              </div>
              <button 
                onClick={() => setShowVideoPopup(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
                title="Close video popup"
                aria-label="Close video popup"
              >
                <div className="w-6 h-6 relative">
                  <div className="absolute inset-0 w-6 h-6 opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-gray-600 rotate-45 transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-gray-600 -rotate-45 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
              </button>
            </div>
            
            {/* Video Content */}
            <div className="relative bg-black aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/oswjtLwCUqg?autoplay=1&rel=0"
                title="Chrome Extension Installation Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Duration: 3:45</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    <span>HD Quality</span>
                  </div>
                </div>
                <Button 
                  onClick={scrollToPurchase}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Get Extension Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Bot */}
      <ChatBot />
    </div>
  );
}