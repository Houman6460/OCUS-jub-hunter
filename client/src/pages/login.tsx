import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { UserCog, Users, Shield, Info } from "lucide-react";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<"admin" | "customer" | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Check if already authenticated
  useState(() => {
    const adminFlag = localStorage.getItem('admin_authenticated');
    const customerToken = localStorage.getItem('customer_token');
    if (adminFlag === 'true') {
      setIsAuthenticated(true);
      setUserType("admin");
    } else if (customerToken) {
      setIsAuthenticated(true);
      setUserType("customer");
    }
  });

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
                  <Input
                    id="customer-password"
                    type="password"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={customerLoginMutation.isPending}
                >
                  {customerLoginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
                
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
                  <Input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={adminLoginMutation.isPending}
                >
                  {adminLoginMutation.isPending ? "Signing in..." : "Admin Sign In"}
                </Button>
                
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