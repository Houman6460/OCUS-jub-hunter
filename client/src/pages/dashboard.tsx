import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Package, Download, ShoppingCart, User, LogOut, Chrome, Key, Ticket, CreditCard, Settings, HelpCircle, Plus, MessageSquare, Send, Paperclip, X, AlertCircle, Clock, CheckCircle2, ArrowRight, Lightbulb, Zap, Shield, AlertTriangle, Image, FileText, Star } from "lucide-react";
import { UserSidebar } from "@/components/UserSidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import UserInvoicesPage from "./user-invoices";
import { AccountPreferences } from "@/components/user/AccountPreferences";
import { ExtensionDownload } from "@/components/user/ExtensionDownload";
import { AffiliateProgram } from "@/components/user/AffiliateProgram";
import { UserPurchases } from "@/components/user/UserPurchases";
import { UserInvoices } from "@/components/user/UserInvoices";
import FirstVisitGuide from "@/components/FirstVisitGuide";
import { DashboardTutorial } from "@/components/tutorials/DashboardTutorial";
import NotificationSystem from "@/components/NotificationSystem";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";



export default function Dashboard() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [customerData, setCustomerData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFirstVisitGuide, setShowFirstVisitGuide] = useState(false);

  // Fetch dashboard features settings
  const { data: dashboardFeatures } = useQuery({
    queryKey: ['/api/admin/dashboard-features'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard-features');
      if (!response.ok) return [];
      return response.json();
    }
  });

  // Helper function to check if a feature is enabled
  const isFeatureEnabled = (featureName: string) => {
    if (!dashboardFeatures || !Array.isArray(dashboardFeatures)) return true;
    const feature = dashboardFeatures.find(f => f.id === featureName || f.featureName === featureName);
    return feature ? feature.isEnabled : true;
  };

  // Check if current active tab is disabled and redirect to profile
  useEffect(() => {
    if (dashboardFeatures && Array.isArray(dashboardFeatures)) {
      const featureMap = {
        'affiliate': 'affiliate-program',
        'analytics': 'analytics',
        'billing': 'billing'
      };
      
      const currentFeature = featureMap[activeTab as keyof typeof featureMap];
      if (currentFeature && !isFeatureEnabled(currentFeature)) {
        setActiveTab('profile'); // Redirect to profile if current tab is disabled
      }
    }
  }, [activeTab, dashboardFeatures]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('customer_token');
    const data = localStorage.getItem('customer_data');
    
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch fresh user data from the secure /api/me endpoint
    fetch('/api/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          // If unauthorized, clear local data and redirect to login
          if (response.status === 401) {
            localStorage.removeItem('customer_token');
            localStorage.removeItem('customer_data');
            navigate('/login');
          }
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then(profileData => {
        if (profileData && profileData.id) { // Check for valid profile data
          setCustomerData(profileData);
          // Update localStorage with fresh data
          localStorage.setItem('customer_data', JSON.stringify(profileData));

          // Check if this is the first visit
          const hasSeenGuide = localStorage.getItem('first-visit-guide-completed');
          if (!hasSeenGuide) {
            setShowFirstVisitGuide(true);
          }
        } else {
          // Handle case where API returns invalid data, maybe logout
          console.error('Invalid profile data from /api/me', profileData);
          handleLogout();
        }
      })
      .catch(error => {
        console.error('Error fetching user profile from /api/me:', error);
        // Fallback to local data if API fails but token exists
        if (data) {
          try {
            setCustomerData(JSON.parse(data));
          } catch (e) {
            handleLogout();
          }
        } else {
          handleLogout();
        }
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Backdrop Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div data-tutorial="sidebar-nav">
        <UserSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden p-2"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              <div data-tutorial="dashboard-header">
                <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">{t.dashboard}</h1>
                <p className="text-gray-600 mt-1 text-sm lg:text-base">{t.welcomeBack}, {customerData?.email || 'User'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Chrome className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
              <span className="text-xs lg:text-sm text-gray-600 hidden sm:inline">OCUS Job Hunter</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">

          
          {/* Tab Content based on activeTab */}
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Welcome Card */}
              <Card className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-2xl text-blue-900 flex items-center gap-3">
                    Welcome back, {customerData?.name || 'User'}! 👋
                    {customerData?.isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 border-yellow-300">
                        <Star className="h-3 w-3 mr-1" />
                        Premium User
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-700 mb-4">
                    Manage your OCUS Job Hunter extension and access all your resources from here. 
                    {customerData?.isPremium 
                      ? 'Your premium extension is ready to help you find profitable delivery jobs!' 
                      : 'Your extension is ready to help you find profitable delivery jobs!'
                    }
                  </p>
                  {customerData?.isPremium && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-green-800 font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Premium Access Active
                      </p>
                      <p className="text-green-700 text-sm mt-1">
                        Unlimited job monitoring • Premium support • Latest updates
                      </p>
                      <p className="text-green-600 text-xs mt-2">
                        Activated: {customerData.premiumActivatedAt ? new Date(customerData.premiumActivatedAt).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  )}
                  {customerData && !customerData?.isPremium && !customerData?.extensionActivated && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-yellow-800 font-medium">🎯 Complete your setup:</p>
                      <p className="text-yellow-700 text-sm mt-1">
                        Purchase and activate your extension to unlock unlimited job monitoring
                      </p>
                    </div>
                  )}
                  {!customerData && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full inline-block mr-2" />
                      <span className="text-gray-600">Loading account information...</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFirstVisitGuide(true)}
                      className="flex items-center gap-2"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Show Setup Guide
                    </Button>
                    {customerData?.isPremium && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('downloads')}
                        className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        <Download className="h-4 w-4" />
                        Download Premium Extension
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Extension Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Extension Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="mb-4">Active</Badge>
                  <p className="text-sm text-gray-600">
                    Your Chrome extension is ready to use. Make sure it's installed and enabled.
                  </p>
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Name:</strong> {customerData?.name || 'User'}</p>
                    <p className="text-sm"><strong>Email:</strong> {customerData?.email || 'user@example.com'}</p>
                    <p className="text-sm flex items-center gap-2">
                      <strong>Status:</strong> 
                      {customerData?.isPremium ? (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900">
                          <Star className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </p>
                    <p className="text-sm"><strong>Joined:</strong> {customerData?.createdAt ? new Date(customerData.createdAt).toLocaleDateString() : 'Recently'}</p>
                    {customerData?.isPremium && (
                      <>
                        <p className="text-sm"><strong>Total Spent:</strong> €{customerData.totalSpent?.toFixed(2) || '0.00'}</p>
                        <p className="text-sm"><strong>Orders:</strong> {customerData.totalOrders || 0}</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <UserPurchases />
          )}

          {/* Downloads Tab */}
          {activeTab === 'downloads' && (
            <div data-tutorial="extension-download">
              {customerData ? (
                <ExtensionDownload customer={customerData} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Extension Downloads
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-gray-600">Loading your account information...</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}


          {/* Support Tab - Show tickets directly */}
          {activeTab === 'support' && (
            <div data-tutorial="support-link">
              <SupportSection customer={customerData || { id: 1, email: 'demo@example.com', name: 'Demo User' }} />
            </div>
          )}

          {/* Get Support Submenu */}
          {activeTab === 'get-support' && customerData && (
            <SupportSection customer={customerData} />
          )}

          {/* User Manual Submenu */}
          {activeTab === 'user-manual' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  User Manual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Learn how to install and use the OCUS Job Hunter Chrome extension.
                  </p>
                  <Button onClick={() => navigate('/manual')} className="w-full">
                    View Installation Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}



          {/* Invoices Tab */}
          {activeTab === 'invoices' && <UserInvoices />}

          {/* Billing Tab */}
          {activeTab === 'billing' && isFeatureEnabled('billing') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing & Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Payment methods and billing history will be available here.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Extension Tab */}
          {activeTab === 'extension' && (
            <div>
              {customerData ? (
                <ExtensionDownload customer={customerData} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Extension Downloads
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-gray-600">Loading your account information...</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && isFeatureEnabled('analytics') && (
            <div>
              {customerData ? (
                <AdvancedAnalytics customerId={customerData.id?.toString()} customerData={customerData} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-gray-600">Loading analytics data...</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Missions Tab */}


          {/* Affiliate Program Tab */}
          {activeTab === 'affiliate' && isFeatureEnabled('affiliate-program') && (
            <AffiliateProgram customer={customerData || { 
              id: 'demo-customer-123',
              email: 'demo@example.com',
              name: 'Demo User',
              referralCode: 'DEMO123'
            }} />
          )}

          {/* Account Preferences Tab */}
          {activeTab === 'preferences' && (
            <AccountPreferences customer={customerData || { 
              id: 'demo-customer-123',
              email: 'demo@example.com',
              name: 'Demo User',
              createdAt: new Date().toISOString(),
              extensionActivated: false,
              totalSpent: 0,
              totalOrders: 0
            }} />
          )}
        </div>
      </div>
      
      {/* First Visit Guide Modal */}
      {showFirstVisitGuide && (
        <FirstVisitGuide
          onClose={() => setShowFirstVisitGuide(false)}
          onStepComplete={(step) => console.log(`Step ${step} completed`)}
          customerData={customerData}
        />
      )}

      {/* Tutorial System */}
      <DashboardTutorial />
    </div>
  );
}

// Support Section Component
function SupportSection({ customer }: { customer: any }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [suggestedSolutions, setSuggestedSolutions] = useState<string[]>([]);

  // Fetch user's tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['/api/tickets', customer.email],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('customerEmail', customer.email);
      const response = await apiRequest('GET', `/api/tickets?${params.toString()}`);
      return await response.json();
    }
  });

  // Create new ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      const response = await apiRequest('POST', '/api/tickets', {
        ...ticketData,
        customerEmail: customer.email,
        customerName: customer.name,
        customerId: customer.id
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Support ticket created successfully" });
      setShowNewTicket(false);
      setNewTicket({ title: '', description: '', category: 'general', priority: 'medium' });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
    },
    onError: (error: any) => {
      const msg = typeof error?.message === 'string' ? error.message : '';
      if (msg.startsWith('404:')) {
        // Ticket missing on server (e.g., store reset). Refresh tickets and messages quietly.
        toast({ title: "Conversation unavailable", description: "This ticket no longer exists on the server. Reloading your tickets.", variant: "destructive" });
        queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
        return;
      }
      toast({ title: "Error", description: msg || 'Failed to send message', variant: "destructive" });
    }
  });

  const handleCreateTicket = () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createTicketMutation.mutate(newTicket);
  };

  // Get priority icon and color
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Zap className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle2 className="h-4 w-4" />;
      case 'closed': return <Shield className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'resolved': return 'outline';
      case 'closed': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Support Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Submit tickets, track progress, and get help from our support team.
            </p>
            <Button onClick={() => setShowNewTicket(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* New Ticket Form - Enhanced with Wizard Steps */}
      {showNewTicket && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center justify-between">
              <span>Create New Support Ticket</span>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Step {currentStep} of 3</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-2 w-8 rounded-full transition-colors ${
                        step <= currentStep ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ticket-title">What's the issue? *</Label>
                  <Input
                    id="ticket-title"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of your issue"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ticket-category">Which area does this relate to?</Label>
                  <Select value={newTicket.category} onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">
                        <span className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Technical Issue
                        </span>
                      </SelectItem>
                      <SelectItem value="billing">
                        <span className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Billing
                        </span>
                      </SelectItem>
                      <SelectItem value="feature">
                        <span className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Feature Request
                        </span>
                      </SelectItem>
                      <SelectItem value="bug">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Bug Report
                        </span>
                      </SelectItem>
                      <SelectItem value="general">
                        <span className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          General Question
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Priority & Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ticket-priority">How urgent is this?</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['low', 'medium', 'high', 'urgent'].map((priority) => (
                      <Button
                        key={priority}
                        type="button"
                        variant={newTicket.priority === priority ? 'default' : 'outline'}
                        onClick={() => setNewTicket(prev => ({ ...prev, priority }))}
                        className={`flex items-center gap-2 ${
                          newTicket.priority === priority ? '' : getPriorityColor(priority)
                        }`}
                      >
                        {getPriorityIcon(priority)}
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="ticket-description">Tell us more about the issue *</Label>
                  <Textarea
                    id="ticket-description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Please describe your issue in detail..."
                    rows={6}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review & Suggestions */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Before submitting, try these solutions:
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Have you checked if the Chrome extension is enabled?</li>
                    <li>• Try refreshing the OCUS platform page</li>
                    <li>• Clear your browser cache and cookies</li>
                    <li>• Ensure you're using the latest version of the extension</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold">Review your ticket:</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Subject:</strong> {newTicket.title}</p>
                    <p><strong>Category:</strong> {newTicket.category}</p>
                    <p className="flex items-center gap-2">
                      <strong>Priority:</strong>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getPriorityColor(newTicket.priority)}`}>
                        {getPriorityIcon(newTicket.priority)}
                        {newTicket.priority}
                      </span>
                    </p>
                    <p><strong>Description:</strong></p>
                    <p className="text-gray-600 whitespace-pre-wrap">{newTicket.description}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between pt-4">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
              ) : (
                <Button variant="outline" onClick={() => {
                  setShowNewTicket(false);
                  setCurrentStep(1);
                }}>
                  Cancel
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && !newTicket.title.trim()) ||
                    (currentStep === 2 && !newTicket.description.trim())
                  }
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    handleCreateTicket();
                    setCurrentStep(1);
                  }}
                  disabled={createTicketMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {createTicketMutation.isPending ? 'Creating...' : 'Submit Ticket'}
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-gray-600">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No support tickets yet</p>
              <p className="text-sm text-gray-500">Create your first ticket to get help from our support team</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket: any) => (
                <div
                  key={ticket.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{ticket.title}</h3>
                    <Badge variant={
                      ticket.status === 'open' ? 'default' :
                      ticket.status === 'in_progress' ? 'secondary' :
                      ticket.status === 'resolved' ? 'outline' :
                      ticket.status === 'archived' ? 'secondary' : 'destructive'
                    }>
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Category: {ticket.category}</span>
                    <span>Priority: {ticket.priority}</span>
                    <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Quick Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Help</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Common Issues</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Extension not loading? Check if Chrome extensions are enabled</li>
                <li>• No jobs appearing? Verify you're on the OCUS platform</li>
                <li>• Activation issues? Check your email for the activation key</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Contact Options</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span>Support tickets (fastest response)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-500" />
                  <span>Email: info@logoland.se
</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span>{selectedTicket?.title}</span>
              <Badge variant={
                selectedTicket?.status === 'open' ? 'default' :
                selectedTicket?.status === 'in_progress' ? 'secondary' :
                selectedTicket?.status === 'resolved' ? 'outline' :
                selectedTicket?.status === 'archived' ? 'secondary' : 'destructive'
              }>
                {selectedTicket?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Created on {selectedTicket && new Date(selectedTicket.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[50vh] pr-4">
            <div className="space-y-4">
              {/* Ticket Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Category:</span>
                    <span className="text-gray-600">{selectedTicket?.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Priority:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${selectedTicket && getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket && getPriorityIcon(selectedTicket.priority)}
                      {selectedTicket?.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2">Description:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket?.description}</p>
                </div>
              </div>
              
              {/* Messages */}
              <TicketMessages ticketId={selectedTicket?.id} customerEmail={customer.email} customerName={customer.name} />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Ticket Messages Component
function TicketMessages({ ticketId, customerEmail, customerName }: { ticketId?: number; customerEmail: string; customerName?: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  
  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: [`/api/tickets/${ticketId}/messages`],
    queryFn: async () => {
      if (!ticketId) return [];
      try {
        const response = await apiRequest('GET', `/api/tickets/${ticketId}/messages`);
        const data = await response.json();
        // Normalize fields for consistent rendering
        return Array.isArray(data)
          ? data.map((m: any) => ({
              id: m.id,
              content: m.content ?? m.message ?? '',
              isFromCustomer: typeof m.isFromCustomer === 'boolean' ? m.isFromCustomer : !m.isAdmin,
              senderName: m.authorName ?? m.senderName ?? m.sender_name ?? 'User',
              createdAt: m.createdAt ?? m.created_at ?? new Date().toISOString(),
              attachments: m.attachments,
            }))
          : [];
      } catch (err: any) {
        // Treat 404 (ticket not found or store reset) as empty conversation
        if (typeof err?.message === 'string' && err.message.startsWith('404:')) {
          return [];
        }
        throw err;
      }
    },
    enabled: !!ticketId
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', `/api/tickets/${ticketId}/messages`, {
        message,
        customerEmail: customerEmail,
        customerName: customerName
      });
      const json = await response.json();
      if (json && json.success === false) {
        throw new Error(json.message || 'Failed to send message');
      }
      return json;
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}/messages`] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Loading messages...</div>;
  }
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Conversation</h4>
      
      {/* Messages List */}
      {messages.length === 0 ? (
        <p className="text-gray-500 text-sm">No messages yet. Send a message to start the conversation.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.isFromCustomer 
                  ? 'bg-blue-50 ml-8' 
                  : 'bg-gray-50 mr-8'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4" />
                <span className="font-medium text-sm">{msg.senderName}</span>
                <span className="text-xs text-gray-500">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{msg.content || msg.message}</p>
              
              {/* Attachments Display */}
              {(() => {
                if (!msg.attachments || typeof msg.attachments !== 'string' || !msg.attachments.trim()) {
                  return null;
                }
                
                try {
                  const attachments = JSON.parse(msg.attachments);
                  if (!Array.isArray(attachments) || attachments.length === 0) {
                    return null;
                  }
                  
                  return (
                    <div className="mt-2 space-y-2">
                      {attachments.map((attachment: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                          {attachment.type?.startsWith('image/') ? (
                            <div className="flex items-center gap-2">
                              <Image className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">{attachment.name}</span>
                              <span className="text-xs text-gray-500">({(attachment.size / 1024).toFixed(1)} KB)</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">{attachment.name}</span>
                              <span className="text-xs text-gray-500">({(attachment.size / 1024).toFixed(1)} KB)</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                } catch (error) {
                  console.error('Failed to parse attachments:', msg.attachments, error instanceof Error ? error.message : error);
                  return null;
                }
              })()}
            </div>
          ))}
        </div>
      )}
      
      {/* Reply Form */}
      <div className="border-t pt-4">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            rows={3}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}