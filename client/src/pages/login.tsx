import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { UserCog, Users, Shield, Info, Eye, EyeOff } from "lucide-react";

// Simple inline SVG target icon to show next to the header title
function TargetIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="50" cy="50" r="48" fill="#ffffff" />
      <circle cx="50" cy="50" r="40" fill="#2F6FB2" />
      <circle cx="50" cy="50" r="30" fill="#ffffff" />
      <circle cx="50" cy="50" r="22" fill="#2F6FB2" />
      <circle cx="50" cy="50" r="12" fill="#ffffff" />
      <circle cx="50" cy="50" r="6" fill="#2F6FB2" />
    </svg>
  );
}

export default function Login() {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<"admin" | "customer" | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Fetch auth settings to show/hide social login buttons
  const { data: authSettings, isLoading: authSettingsLoading } = useQuery({
    queryKey: ['auth-settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/auth-settings');
      const data = await response.json();
      return data;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: 1000
  });

  // Determine if social login should be shown based on auth settings
  const shouldShowSocial = !authSettingsLoading && (authSettings?.googleEnabled || authSettings?.facebookEnabled || authSettings?.githubEnabled);

  // Check if already authenticated
  useEffect(() => {
    const adminFlag = localStorage.getItem('admin_authenticated');
    const customerToken = localStorage.getItem('customer_token');
    if (adminFlag === 'true') {
      setIsAuthenticated(true);
      setUserType("admin");
    } else if (customerToken) {
      setIsAuthenticated(true);
      setUserType("customer");
    }
  }, []);

  const adminLoginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      return await apiRequest("POST", "/api/admin/login", data);
    },
    onSuccess: () => {
      localStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
      setUserType("admin");
      toast({
        title: t.loginSuccessful || "Login Successful",
        description: t.welcomeBack || "Welcome back, Admin!",
      });
      // Redirect to admin page
      window.location.href = '/admin';
    },
    onError: (error: any) => {
      toast({
        title: t.loginFailed || "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const customerLoginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/customer/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('customer_token', data.token);
      setIsAuthenticated(true);
      setUserType("customer");
      toast({
        title: t.loginSuccessful || "Login Successful",
        description: t.welcome || "Welcome!",
      });
      // Redirect to support page
      window.location.href = '/support';
    },
    onError: (error: any) => {
      toast({
        title: t.loginFailed || "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adminLoginMutation.mutate({ email: adminEmail, password: adminPassword });
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    customerLoginMutation.mutate({ email: customerEmail, password: customerPassword });
  };

  const fillDemoCredentials = (type: "admin" | "customer") => {
    if (type === "admin") {
      setAdminEmail("info@logoland.se");
      setAdminPassword("demo123");
    } else {
      setCustomerEmail("customer@demo.com");
      setCustomerPassword("customer123");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('customer_token');
    setIsAuthenticated(false);
    setUserType(null);
    setAdminEmail("");
    setAdminPassword("");
    setCustomerEmail("");
    setCustomerPassword("");
    queryClient.clear();
    window.location.href = '/';
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'github') => {
    // Redirect to OAuth provider
    window.location.href = `/api/auth/${provider}`;
  };

  // If already authenticated, show logout option
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">OCUS Dashboard</CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              {userType === "admin" ? "Admin Panel Access" : "Customer Account"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <Badge variant={userType === "admin" ? "default" : "secondary"} className="text-sm">
                <Shield className="w-4 h-4 mr-1" />
                {userType === "admin" ? "Administrator" : "Customer"}
              </Badge>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.href = userType === "admin" ? '/admin' : '/support'}
                  className="w-full"
                >
                  {userType === "admin" ? "Go to Admin Panel" : "Go to Support Dashboard"}
                </Button>
                
                <Button onClick={handleLogout} variant="outline" className="w-full">
                  {t.logout || "Logout"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2">
            <TargetIcon className="w-7 h-7" />
            <CardTitle className="text-2xl font-bold">OCUS Login</CardTitle>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Choose your account type to sign in
          </p>
          <div className="flex justify-center mt-4">
            <LanguageSelector />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Customer
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <UserCog className="w-4 h-4" />
                Admin
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer" className="space-y-4 mt-6">
              <div className="text-center mb-4">
                <h3 className="font-medium">Customer Portal</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Access your downloads and support tickets
                </p>
              </div>
              
              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="customer-email">Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    placeholder="customer@demo.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="customer-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="customer-password"
                      type={showCustomerPassword ? "text" : "password"}
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      required
                      placeholder="Enter password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                    >
                      {showCustomerPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={customerLoginMutation.isPending}
                >
                  {customerLoginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
                
                {/* Social Login Section - Conditional */}
                {shouldShowSocial && (
                  <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {authSettings?.googleEnabled && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin('google')}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>
                  )}
                  
                  {authSettings?.facebookEnabled && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin('facebook')}
                    >
                      <svg className="w-4 h-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Continue with Facebook
                    </Button>
                  )}
                  
                  {authSettings?.githubEnabled && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin('github')}
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.30 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      Continue with GitHub
                    </Button>
                  )}
                </div>
                  </>
                )}
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => fillDemoCredentials("customer")}
                  className="w-full"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Use Demo Credentials
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="admin" className="space-y-4 mt-6">
              <div className="text-center mb-4">
                <h3 className="font-medium">Admin Panel</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Access system administration tools
                </p>
              </div>
              
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    placeholder="info@logoland.se"
                  />
                </div>
                
                <div>
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      type={showAdminPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      placeholder="Enter password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                    >
                      {showAdminPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={adminLoginMutation.isPending}
                >
                  {adminLoginMutation.isPending ? "Signing in..." : "Admin Sign In"}
                </Button>
                
                {/* Social Login Section - Conditional */}
                {shouldShowSocial && (
                  <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {authSettings?.googleEnabled && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin('google')}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>
                  )}
                  
                  {authSettings?.facebookEnabled && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin('facebook')}
                    >
                      <svg className="w-4 h-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Continue with Facebook
                    </Button>
                  )}
                  
                  {authSettings?.githubEnabled && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSocialLogin('github')}
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.30 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      Continue with GitHub
                    </Button>
                  )}
                </div>
                  </>
                )}
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => fillDemoCredentials("admin")}
                  className="w-full"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Use Demo Credentials
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Demo Credentials:</h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>Admin:</strong> info@logoland.se / demo123</p>
              <p><strong>Customer:</strong> customer@demo.com / customer123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}