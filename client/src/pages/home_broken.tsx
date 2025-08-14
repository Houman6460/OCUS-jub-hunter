import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Link } from "wouter";
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
  List,
  Check,
  ShoppingCart,
  Mail,
  Phone,
  MessageCircle,
  ChevronDown,
  Clock,
  BarChart3
} from "lucide-react";

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({});

  const toggleFAQ = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const scrollToPurchase = () => {
    const pricingSection = document.getElementById('pricing');
    pricingSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: Bot,
      title: "Fully Automated Photography Job Search",
      description: "Automatically finds all Ubereats and Foodora photography gigs in your area without manual browsing of OCUS."
    },
    {
      icon: Shield,
      title: "Auto-Login Feature", 
      description: "Automatically logs you back into your OCUS account using your saved credentials when the system logs you out without reason."
    },
    {
      icon: Bell,
      title: "Real-time Alerts",
      description: "Get instant notifications when new photography jobs for Ubereats/Foodora are posted in your location."
    },
    {
      icon: Filter,
      title: "Location-Based Filtering",
      description: "Smart filtering based on your area to show only relevant photography opportunities near you."
    },
    {
      icon: Globe,
      title: "Google Chrome Extension",
      description: "Works as a Chrome browser extension - easy to install and use while browsing OCUS website."
    },
    {
      icon: Download,
      title: "One-Time Payment",
      description: "Buy once, use forever. No monthly subscriptions or hidden fees - lifetime access included."
    }
  ];

  const testimonials = [
    {
      name: "Marco Bianchi",
      role: "Food Photographer - Milan, Italy",
      avatar: "MB",
      rating: 5,
      location: "🇮🇹 Milan, Italy",
      text: "Amazing! Before this extension, I spent 2-3 hours daily checking OCUS for Ubereats gigs. Now it finds everything automatically. Made €3,500 extra last month just from the jobs I would have missed!"
    },
    {
      name: "Sophie Dubois", 
      role: "Foodora Photographer - Paris, France",
      avatar: "SD",
      rating: 5,
      location: "🇫🇷 Paris, France",
      text: "The auto-login feature is genius! OCUS kept logging me out during busy lunch hours. This extension logs me back in instantly so I never miss urgent photography requests. Worth every euro!"
    },
    {
      name: "James Thompson",
      role: "Food Photography Specialist - London, UK", 
      avatar: "JT",
      rating: 5,
      location: "🇬🇧 London, UK",
      text: "Game changer for my Ubereats photography business. The extension captures jobs in my area faster than manual searching. Auto-login saved me from missing jobs when OCUS session expired!"
    },
    {
      name: "Carlos Martinez",
      role: "Delivery App Photographer - Barcelona, Spain",
      avatar: "CM",
      rating: 5,
      location: "🇪🇸 Barcelona, Spain", 
      text: "Perfecto! Now I get all Foodora photography jobs automatically. The location filtering shows only my area jobs. Auto-login keeps me connected even when OCUS logs out randomly."
    },
    {
      name: "Emma Wilson",
      role: "Food Photography - New York, USA",
      avatar: "EW",
      rating: 5,
      location: "🇺🇸 New York, USA",
      text: "This extension transformed my photography income! It finds all Ubereats shoots in NYC automatically. Auto-login feature ensures I'm always ready when jobs appear. Best $500 investment ever!"
    },
    {
      name: "David Chen",
      role: "Delivery Platform Photographer - Los Angeles, USA", 
      avatar: "DC",
      rating: 5,
      location: "🇺🇸 Los Angeles, USA",
      text: "Incredible time saver! Used to miss photography gigs because OCUS would log me out. This extension auto-logs me back in and finds all local Foodora/Ubereats jobs. Increased my monthly income by 40%!"
    }
  ];

  const faqs = [
    {
      question: "How does the extension automatically find photography jobs?",
      answer: "The extension monitors OCUS specifically for Ubereats and Foodora photography gigs in your area. It automatically scans job categories, applies location-based filters, and updates in real-time as new photography opportunities are posted."
    },
    {
      question: "How does the auto-login feature work?",
      answer: "The extension securely stores your OCUS credentials and automatically logs you back in when the system logs you out without reason. This ensures you never miss urgent photography job postings during busy periods."
    },
    {
      question: "Is this only for Chrome browsers?",
      answer: "Yes, this is specifically a Google Chrome Extension designed to work seamlessly with Chrome while browsing OCUS.com. It integrates directly into your Chrome browser for the best performance."
    },
    {
      question: "Will this work for photography jobs outside Ubereats/Foodora?",
      answer: "This extension is specifically optimized for Ubereats and Foodora photography gigs on OCUS. While it may capture other food photography jobs, it's designed primarily for these two major delivery platforms."
    },
    {
      question: "Is the $500 really a one-time payment?",
      answer: "Yes! Pay $500 once and use the extension forever. No monthly subscriptions, no hidden fees, no renewal charges. All future updates included free with your purchase."
    },
    {
      question: "What if I'm not satisfied with the extension?",
      answer: "We offer a 30-day money-back guarantee. If the extension doesn't help you capture more photography jobs or doesn't work as promised, contact us for a full refund, no questions asked."
    },
    {
      question: "Does it work in different countries/cities?",
      answer: "Yes! The extension works wherever OCUS operates and Ubereats/Foodora need photographers. It automatically filters jobs based on your location settings to show only relevant opportunities in your area."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bot className="text-2xl text-primary mr-3" />
              <span className="text-xl font-bold text-slate-900">OCUS Photography Job Hunter</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-primary transition-colors">Features</a>
              <Link href="/manual" className="text-slate-600 hover:text-primary transition-colors">Manual</Link>
              <a href="#pricing" className="text-slate-600 hover:text-primary transition-colors">Pricing</a>
              <a href="#faq" className="text-slate-600 hover:text-primary transition-colors">FAQ</a>
              <Button onClick={scrollToPurchase} className="bg-primary text-white hover:bg-secondary">
                Get Extension
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-accent/10 text-accent mb-6">
                <Bot className="w-4 h-4 mr-2" />
                Automate Your Job Search
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
                Capture All <span className="text-black font-black">OCUS</span> Photography Jobs
                <span className="text-primary"> Automatically</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                <strong>No need to monitor manually - the extension will do that for you automatically!</strong>
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                This <strong>Google Chrome Extension</strong> automatically finds Ubereats and Foodora photography gigs on OCUS, plus auto-login to your account when the system logs you out without reason.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/checkout">
                  <Button size="lg" className="bg-primary text-white hover:bg-secondary transform hover:scale-105 shadow-lg">
                    <Download className="mr-2 h-4 w-4" />
                    One-Time Payment - Use Forever - $500
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:border-primary hover:text-primary">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center text-sm text-slate-500">
                <Shield className="text-accent mr-2 h-4 w-4" />
                <span>30-day money-back guarantee</span>
                <span className="mx-4">•</span>
                <span>2,847 happy customers</span>
              </div>
            </div>
            <div className="relative">
              {/* Browser mockup */}
              <Card className="shadow-2xl relative">
                <div className="flex items-center p-4 border-b bg-gray-100">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 mx-4 bg-slate-100 rounded px-3 py-1 text-sm text-slate-600">
                    ocus.com/jobs
                  </div>
                </div>
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
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Extension Interface & Features
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Interactive preview of the <strong>Chrome Extension</strong> interface
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Complete Extension Panel */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden max-h-[600px]" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", width: "380px" }}>
              {/* Extension Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-blue-500 text-white">
                <h3 className="text-lg font-medium">OCUS Unified Extension</h3>
                <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">Active</span>
              </div>
              
              {/* Scrollable Content */}
              <div className="overflow-y-auto h-[520px] p-4 space-y-4">
                {/* Auto Login Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <span className="font-medium text-sm">Auto Login Configuration</span>
                    <div className="relative inline-block w-12 h-6">
                      <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">OCUS Username</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50" 
                        value="photographer@example.com"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">OCUS Password</label>
                      <input 
                        type="password" 
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50" 
                        value="••••••••"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Max Login Attempts</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50" 
                        value="5"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Mission Monitor Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <span className="font-medium text-sm">Mission Monitor Configuration</span>
                    <div className="relative inline-block w-12 h-6">
                      <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Refresh Interval (sec)</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50" 
                          value="30"
                          readOnly
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Max Simultaneous Missions</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50" 
                          value="3"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-600">Show Notifications</label>
                      <div className="relative inline-block w-12 h-6">
                        <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                          <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mission Acceptor Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <span className="font-medium text-sm">Mission Acceptor Configuration</span>
                    <div className="relative inline-block w-12 h-6">
                      <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-600">Auto Close Tab After Accept</label>
                      <div className="relative inline-block w-12 h-6">
                        <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                          <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Close Delay (sec)</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50" 
                        value="2"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Page Refresh Timer Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <span className="font-medium text-sm">Page Refresh Timer</span>
                    <div className="relative inline-block w-12 h-6">
                      <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Refresh Interval</label>
                      <div className="flex gap-1 mb-2">
                        <button className="flex-1 px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200">5s</button>
                        <button className="flex-1 px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200">10s</button>
                        <button className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white border border-blue-500 rounded">20s</button>
                        <button className="flex-1 px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200">30s</button>
                      </div>
                      <div className="flex space-x-2">
                        <input 
                          type="number" 
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50" 
                          placeholder="20"
                          readOnly
                        />
                        <button className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">Set</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-600">Show Countdown Panel</label>
                      <div className="relative inline-block w-12 h-6">
                        <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                          <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <span className="font-medium text-sm">Statistics</span>
                    <button className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">Reset</button>
                  </div>
                  <div className="p-4">
                    <div className="bg-gray-50 rounded p-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="font-medium">Missions Found:</span>
                        <span>240</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Missions Opened:</span>
                        <span>0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Missions Accepted:</span>
                        <span>11</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Login Attempts:</span>
                        <span>0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Successful Logins:</span>
                        <span>0</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex justify-between space-x-3">
                  <button className="flex-1 px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600">Save Configuration</button>
                  <button className="flex-1 px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600">Emergency Stop</button>
                </div>

                <div className="text-center text-xs text-gray-500">
                  Press Alt+E on any OCUS page to access emergency controls
                </div>
              </div>
            </div>

            {/* Page Refresh Timer */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg mb-4 flex items-center justify-between">
                <span className="font-medium">Page Refresh</span>
                <button className="text-white hover:text-gray-200">×</button>
              </div>
              <div className="text-6xl font-bold text-gray-800 mb-4">14s</div>
              <div className="flex justify-center space-x-2">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">Pause</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">Refresh Now</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">Stats</button>
              </div>
              <div className="mt-6 text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Real-Time Monitoring</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Live countdown to next refresh</li>
                  <li>• Manual pause/resume controls</li>
                  <li>• Instant refresh capability</li>
                  <li>• Non-intrusive overlay design</li>
                </ul>
              </div>
            </div>

            {/* Statistics Panel */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-green-500 text-white px-4 py-2 flex items-center justify-between">
                <span className="font-medium">OCUS Statistics</span>
                <button className="text-white hover:text-gray-200">×</button>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Missions Found:</span>
                  <span className="font-bold">240</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Missions Opened:</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Missions Accepted:</span>
                  <span className="font-bold">11</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Refreshes:</span>
                  <span className="font-bold">509238</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Login Attempts:</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="text-center text-xs text-gray-500 mt-4">
                  Last refresh: 18:03:45
                </div>
              </div>
              <div className="px-6 pb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Performance Analytics</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Track photography jobs found</li>
                  <li>• Monitor acceptance success rate</li>
                  <li>• View extension activity metrics</li>
                  <li>• Real-time refresh timestamps</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Detailed Feature Explanations */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              Complete Extension Feature Review
            </h3>
            
            <div className="space-y-8">
                {/* Auto Login Configuration */}
                <div className="border-l-4 border-blue-500 pl-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <Shield className="h-5 w-5 text-blue-500 mr-2" />
                    Auto Login Configuration
                  </h4>
                  <p className="text-slate-700 mb-3">
                    <strong>The Problem:</strong> OCUS frequently logs photographers out without warning, causing you to miss lucrative €80-100 photography assignments.
                  </p>
                  <p className="text-slate-700 mb-3">
                    <strong>The Solution:</strong> Store your OCUS credentials securely in the extension. When the system detects you've been logged out, it automatically logs you back in within seconds.
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• <strong>Username/Password Storage:</strong> Encrypted local storage of your OCUS credentials</li>
                    <li>• <strong>Max Login Attempts:</strong> Prevents infinite loops - stops after 5 failed attempts</li>
                    <li>• <strong>Instant Recovery:</strong> Automatic re-authentication when sessions expire</li>
                    <li>• <strong>Zero Downtime:</strong> Keep monitoring jobs even when OCUS logs you out</li>
                  </ul>
                </div>

                {/* Mission Monitor Configuration */}
                <div className="border-l-4 border-green-500 pl-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <Bell className="h-5 w-5 text-green-500 mr-2" />
                    Mission Monitor Configuration
                  </h4>
                  <p className="text-slate-700 mb-3">
                    <strong>The Problem:</strong> Photography assignments appear and disappear within minutes. Manual checking means missing opportunities.
                  </p>
                  <p className="text-slate-700 mb-3">
                    <strong>The Solution:</strong> Automated monitoring that refreshes the OCUS page every 30 seconds, scanning for new Ubereats and Foodora photography jobs.
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• <strong>30-Second Refresh Rate:</strong> Optimal balance between finding jobs quickly and not overwhelming OCUS servers</li>
                    <li>• <strong>3 Max Simultaneous Missions:</strong> Track multiple assignments without system overload</li>
                    <li>• <strong>Desktop Notifications:</strong> Instant alerts when new photography jobs appear in your area</li>
                    <li>• <strong>Smart Detection:</strong> Automatically identifies restaurant photography assignments</li>
                  </ul>
                </div>

                {/* Mission Acceptor Configuration */}
                <div className="border-l-4 border-purple-500 pl-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <Check className="h-5 w-5 text-purple-500 mr-2" />
                    Mission Acceptor Configuration
                  </h4>
                  <p className="text-slate-700 mb-3">
                    <strong>The Problem:</strong> Even after finding jobs, you need to manually click through multiple pages to accept assignments.
                  </p>
                  <p className="text-slate-700 mb-3">
                    <strong>The Solution:</strong> Streamlined acceptance process with automatic tab management to speed up your workflow.
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• <strong>Auto Close Tab:</strong> Automatically closes job tabs after successful acceptance</li>
                    <li>• <strong>2-Second Delay:</strong> Brief pause to ensure acceptance was processed before closing</li>
                    <li>• <strong>Clean Workflow:</strong> Reduces browser clutter when managing multiple assignments</li>
                    <li>• <strong>Efficiency Boost:</strong> Focus on photography instead of tab management</li>
                  </ul>
                </div>

                {/* Page Refresh Timer */}
                <div className="border-l-4 border-orange-500 pl-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <Clock className="h-5 w-5 text-orange-500 mr-2" />
                    Page Refresh Timer & Live Countdown
                  </h4>
                  <p className="text-slate-700 mb-3">
                    <strong>The Problem:</strong> You never know when the extension is working or when the next scan will happen.
                  </p>
                  <p className="text-slate-700 mb-3">
                    <strong>The Solution:</strong> Visual countdown overlay showing exactly when the next job scan will occur, with manual controls.
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• <strong>Live Countdown:</strong> See exactly how many seconds until next refresh (14s in example)</li>
                    <li>• <strong>Flexible Timing:</strong> Choose from 5s, 10s, 20s, or 30s intervals based on job availability</li>
                    <li>• <strong>Manual Override:</strong> Pause monitoring or refresh immediately when needed</li>
                    <li>• <strong>Non-Intrusive:</strong> Small overlay that doesn't interfere with OCUS website usage</li>
                  </ul>
                </div>

                {/* Statistics & Performance */}
                <div className="border-l-4 border-red-500 pl-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <BarChart3 className="h-5 w-5 text-red-500 mr-2" />
                    Performance Statistics & Analytics
                  </h4>
                  <p className="text-slate-700 mb-3">
                    <strong>The Problem:</strong> No way to track your job hunting success rate or optimize your strategy for maximum earnings.
                  </p>
                  <p className="text-slate-700 mb-3">
                    <strong>The Solution:</strong> Comprehensive analytics showing your photography job hunting performance and success metrics.
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• <strong>240 Missions Found:</strong> Total photography assignments discovered by the extension</li>
                    <li>• <strong>11 Missions Accepted:</strong> Jobs you successfully claimed (4.6% success rate in example)</li>
                    <li>• <strong>509,238 Total Refreshes:</strong> Shows extension is actively working around the clock</li>
                    <li>• <strong>Last Refresh: 18:03:45:</strong> Confirms real-time operation and current activity</li>
                    <li>• <strong>Performance Insights:</strong> Track which times/days yield the most photography opportunities</li>
                  </ul>
                </div>

                {/* Emergency Controls */}
                <div className="border-l-4 border-gray-500 pl-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <Shield className="h-5 w-5 text-gray-500 mr-2" />
                    Emergency Controls & Safety Features
                  </h4>
                  <p className="text-slate-700 mb-3">
                    <strong>The Problem:</strong> Need immediate control to stop or pause extension activity if something goes wrong.
                  </p>
                  <p className="text-slate-700 mb-3">
                    <strong>The Solution:</strong> Multiple emergency stop mechanisms and keyboard shortcuts for instant control.
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• <strong>Emergency Stop Button:</strong> Immediately halts all extension activity</li>
                    <li>• <strong>Alt+E Shortcut:</strong> Quick access to emergency controls from any OCUS page</li>
                    <li>• <strong>Save Configuration:</strong> Preserve your optimal settings for consistent performance</li>
                    <li>• <strong>Reset Statistics:</strong> Clear tracking data to start fresh monitoring cycles</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Real-World Impact for Photography Work</h4>
                <p className="text-blue-800">
                  This extension transforms photography job hunting from a manual, time-intensive process into an automated system. 
                  Instead of constantly refreshing OCUS hoping to catch €80-100 assignments, the extension monitors 24/7, 
                  automatically handles login issues, and provides performance data to optimize your earnings strategy. 
                  Professional photographers report capturing 3-5x more assignments after using this automation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Summary */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              Why These Features Matter for Photography Work
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  Time-Critical Job Hunting
                </h4>
                <p className="text-slate-600">
                  Ubereats and Foodora photography assignments appear and disappear quickly. The extension's 30-second refresh rate ensures you never miss opportunities while you're away from your computer.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                  <Shield className="h-5 w-5 text-accent mr-2" />
                  Automatic Session Management
                </h4>
                <p className="text-slate-600">
                  OCUS frequently logs users out without warning. The auto-login feature immediately logs you back in, preventing missed assignments due to authentication issues.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                  <BarChart3 className="h-5 w-5 text-secondary mr-2" />
                  Performance Tracking
                </h4>
                <p className="text-slate-600">
                  Track your success rate and optimize your job hunting strategy. See exactly how many assignments you're finding and accepting to maximize your €80-100 per assignment earnings.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                  <Bell className="h-5 w-5 text-primary mr-2" />
                  Instant Notifications
                </h4>
                <p className="text-slate-600">
                  Get notified the moment new photography jobs appear in your area. No more constantly checking the OCUS website - the extension does the monitoring for you.
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
              Why Choose OCUS Photography Job Hunter?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              This <strong>Google Chrome Extension</strong> is specifically designed for photographers working with Ubereats and Foodora through OCUS
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="text-center p-8 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-xl mb-6">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section id="guide" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Easy Installation & Setup
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get started in less than 2 minutes with our simple installation process
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Download the Extension",
                  description: "After purchase, you'll receive a download link via email with the .crx extension file.",
                  note: "The file will be named: ocus-job-hunter-extension.crx"
                },
                {
                  step: "2", 
                  title: "Enable Developer Mode",
                  description: "Open Chrome, go to Extensions (chrome://extensions/), and toggle \"Developer mode\" in the top right.",
                  note: "This is required for installing extensions from file",
                  warning: true
                },
                {
                  step: "3",
                  title: "Install Extension", 
                  description: "Drag and drop the .crx file into your Chrome extensions page, or click \"Load unpacked\" and select the file."
                },
                {
                  step: "✓",
                  title: "Start Using",
                  description: "Navigate to OCUS.com, and the extension will automatically start finding jobs for you!",
                  note: "You'll see the extension icon in your browser toolbar",
                  success: true
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 ${item.success ? 'bg-accent' : 'bg-primary'} text-white rounded-full flex items-center justify-center font-bold`}>
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 mb-3">{item.description}</p>
                    {item.note && (
                      <div className={`rounded-lg p-3 text-sm ${
                        item.warning ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
                        item.success ? 'bg-accent/10 border border-accent/20 text-accent' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              {/* Chrome extensions page mockup */}
              <Card className="shadow-2xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="ml-4 text-sm text-gray-600">chrome://extensions/</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Extensions</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Developer mode</span>
                      <div className="w-10 h-6 bg-primary rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                      </div>
                    </div>
                  </div>
                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Bot className="text-primary text-xl" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">OCUS Job Hunter</h4>
                        <p className="text-sm text-gray-600">Automate your OCUS job search</p>
                      </div>
                      <div className="w-10 h-6 bg-accent rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                      </div>
                    </div>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Usage Instructions */}
          <Card className="mt-16 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">How to Use the Extension</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Globe, title: "Visit OCUS", description: "Navigate to ocus.com in your Chrome browser" },
                  { icon: Play, title: "Auto-Activate", description: "The extension automatically starts scanning for jobs" },
                  { icon: List, title: "View Results", description: "Click the extension icon to see all found jobs" }
                ].map((step, i) => (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">{step.title}</h4>
                    <p className="text-slate-600 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              What Photographers Are Saying
            </h2>
            <p className="text-xl text-slate-600">
              Join photographers across Europe and US who've transformed their OCUS experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="bg-slate-50 relative">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                      <p className="text-slate-600 text-sm">{testimonial.role}</p>
                      <p className="text-slate-500 text-xs mt-1">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Get OCUS Photography Job Hunter Today
            </h2>
            <p className="text-xl text-slate-600">
              One-time purchase, lifetime access
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="shadow-xl border-2 border-primary/20">
              <div className="bg-gradient-to-r from-primary to-secondary p-6 text-center text-white">
                <h3 className="text-2xl font-bold mb-2">OCUS Photography Job Hunter</h3>
                <div className="text-4xl font-bold mb-2">
                  $500
                  <span className="text-lg font-normal opacity-80 ml-2">one-time</span>
                </div>
                <p className="opacity-90">Lifetime access, no recurring fees</p>
              </div>
              
              <CardContent className="p-8">
                <ul className="space-y-4 mb-8">
                  {[
                    "Auto-find Ubereats & Foodora photography gigs",
                    "Auto-login when OCUS logs you out", 
                    "Location-based filtering for your area",
                    "Real-time alerts for new photography jobs",
                    "Google Chrome Extension - easy to use", 
                    "One-time payment - use forever",
                    "30-day money-back guarantee"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="text-accent mr-3 h-4 w-4" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/checkout">
                  <Button className="w-full bg-primary text-white py-4 text-lg font-bold hover:bg-secondary transform hover:scale-105 shadow-lg mb-6">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy Now - Instant Download
                  </Button>
                </Link>

                <div className="text-center text-sm text-slate-500 mb-6">
                  Secure payment powered by Stripe & PayPal
                </div>

                <Card className="bg-slate-50 text-center p-4">
                  <Shield className="text-accent text-xl mx-auto mb-2" />
                  <p className="text-sm text-slate-600">
                    <strong>100% Secure Purchase</strong><br />
                    SSL encrypted & PCI compliant
                  </p>
                </Card>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">2,847</div>
              <div className="text-slate-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">4.9/5</div>
              <div className="text-slate-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">99%</div>
              <div className="text-slate-600">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-slate-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to know about the OCUS Job Hunter extension
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <Card key={i} className="border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => toggleFAQ(i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                  <ChevronDown className={`text-slate-400 transition-transform ${faqOpen[i] ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen[i] && (
                  <div className="px-6 pb-4 text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Bot className="text-2xl text-primary mr-3" />
                <span className="text-xl font-bold">OCUS Photography Job Hunter</span>
              </div>
              <p className="text-slate-400 mb-4">
                Automate your OCUS photography job search for Ubereats & Foodora with auto-login feature.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#guide" className="hover:text-white transition-colors">Installation Guide</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="mailto:support@ocusjobhunter.com" className="hover:text-white transition-colors flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 OCUS Job Hunter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
