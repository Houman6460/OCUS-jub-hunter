import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Shield, Chrome, Github, Facebook, Lock, User, EyeOff, Eye } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function UnifiedLogin() {
  // Form states
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("user");
  const [showRegistration, setShowRegistration] = useState(false);
  
  // Registration form states
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regName, setRegName] = useState("");
  
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  // Store tab preference
  useEffect(() => {
    const savedTab = localStorage.getItem('login_tab_preference');
    if (savedTab === 'admin' || savedTab === 'user') {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('login_tab_preference', value);
  };

  // Fetch auth settings
  const { data: authSettings } = useQuery({
    queryKey: ['/api/auth-settings'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/auth-settings");
      return response.json();
    }
  });

  // Load reCAPTCHA script
  useEffect(() => {
    if (authSettings?.recaptchaEnabled && authSettings?.recaptchaSiteKey && !recaptchaLoaded) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${authSettings.recaptchaSiteKey}`;
      script.onload = () => setRecaptchaLoaded(true);
      document.head.appendChild(script);
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [authSettings, recaptchaLoaded]);

  // reCAPTCHA verification
  const verifyRecaptcha = async (action: string): Promise<string | null> => {
    if (!authSettings?.recaptchaEnabled || !window.grecaptcha) {
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(authSettings.recaptchaSiteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      return null;
    }
  };

  // Admin login mutation
  const adminLoginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string; recaptchaToken: string | null }) => {
      const response = await apiRequest("POST", "/api/admin/login", credentials);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Admin login successful" });
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_user', JSON.stringify({ username: adminUsername, role: 'admin' }));
      // Redirect directly to admin dashboard
      window.location.href = '/admin';
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Customer login mutation
  const customerLoginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string; recaptchaToken: string | null }) => {
      const response = await apiRequest("POST", "/api/customer/login", credentials);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: "Login successful" });
      localStorage.setItem('customer_token', data.token);
      if (data.user) {
        localStorage.setItem('customer_data', JSON.stringify(data.user));
      }
      // Redirect to customer dashboard
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Handle admin login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let recaptchaToken = null;
    if (authSettings?.recaptchaEnabled && authSettings?.recaptchaAdminEnabled) {
      recaptchaToken = await verifyRecaptcha('admin_login');
      if (!recaptchaToken) {
        toast({ title: "Error", description: "reCAPTCHA verification failed", variant: "destructive" });
        return;
      }
    }

    adminLoginMutation.mutate({
      username: adminUsername,
      password: adminPassword,
      recaptchaToken
    });
  };

  // Handle customer login
  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let recaptchaToken = null;
    if (authSettings?.recaptchaEnabled && authSettings?.recaptchaCustomerEnabled) {
      recaptchaToken = await verifyRecaptcha('customer_login');
      if (!recaptchaToken) {
        toast({ title: "Error", description: "reCAPTCHA verification failed", variant: "destructive" });
        return;
      }
    }

    customerLoginMutation.mutate({
      email: customerEmail,
      password: customerPassword,
      recaptchaToken
    });
  };

  // Social login handlers
  const handleSocialLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };



  // Registration mutation
  const registrationMutation = useMutation({
    mutationFn: async (userData: { email: string; password: string; name: string; captchaId: string; captchaAnswer: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Registration successful! Please login with your credentials." });
      setShowRegistration(false);
      // Clear registration form
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");
      setRegName("");
      // Set login form with registered email
      setCustomerEmail(regEmail);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (regPassword !== regConfirmPassword) {
      toast({ title: "Error", description: "As senhas não coincidem", variant: "destructive" });
      return;
    }

    if (regPassword.length < 6) {
      toast({ title: "Error", description: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }

    let recaptchaToken = null;
    if (authSettings?.recaptchaEnabled && authSettings?.recaptchaCustomerEnabled) {
      recaptchaToken = await verifyRecaptcha('register');
      if (!recaptchaToken) {
        toast({ title: "Error", description: "reCAPTCHA verification failed", variant: "destructive" });
        return;
      }
    }

    registrationMutation.mutate({
      email: regEmail,
      password: regPassword,
      name: regName,
      captchaId: "", // Skip CAPTCHA for now
      captchaAnswer: ""
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header variant="compact" />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Chrome className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{t.welcome_back}</h2>
            <p className="mt-3 text-lg text-gray-600">{t.sign_in_account}</p>
          </div>

          <Card className="shadow-2xl border-0 bg-white backdrop-blur-sm rounded-2xl overflow-hidden">
          {!showRegistration ? (
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="user" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200">
                  <Users className="h-4 w-4" />
                  {t.user_login}
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200">
                  <Shield className="h-4 w-4" />
                  {t.admin_login}
                </TabsTrigger>
              </TabsList>

            {/* User Login Tab */}
            <TabsContent value="user">
              <CardContent className="pt-8 px-8 pb-8">
                <form onSubmit={handleCustomerLogin} className="space-y-6">
                  <div>
                    <Label htmlFor="customer-email" className="text-sm font-medium text-gray-700">{t.your_email}</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="luka-mestre@gmail.com"
                      className="mt-2 py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="customer-password" className="text-sm font-medium text-gray-700">{t.your_password}</Label>
                    <div className="mt-2 relative">
                      <Input
                        id="customer-password"
                        type={showCustomerPassword ? "text" : "password"}
                        value={customerPassword}
                        onChange={(e) => setCustomerPassword(e.target.value)}
                        placeholder="••••••••••"
                        className="py-3 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                      >
                        {showCustomerPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium shadow-lg transform transition-all duration-200 hover:scale-105"
                    disabled={customerLoginMutation.isPending}
                  >
                    {customerLoginMutation.isPending ? 'Signing in...' : t.login_btn}
                  </Button>

                  {/* Social Login Options */}
                  <div className="space-y-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">{t.or_login_with}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full py-3 border-2 border-gray-200 hover:border-gray-300 rounded-lg flex items-center justify-center gap-3"
                            onClick={() => handleSocialLogin('google')}
                          >
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">G</span>
                            </div>
                            {t.login_with_google}
                          </Button>
                        
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full py-3 border-2 border-gray-200 hover:border-gray-300 rounded-lg flex items-center justify-center gap-3"
                            onClick={() => handleSocialLogin('facebook')}
                          >
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <Facebook className="h-3 w-3 text-white" />
                            </div>
                            {t.login_with_facebook}
                          </Button>
                        
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full py-3 border-2 border-gray-200 hover:border-gray-300 rounded-lg flex items-center justify-center gap-3"
                            onClick={() => handleSocialLogin('github')}
                          >
                            <div className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center">
                              <Github className="h-3 w-3 text-white" />
                            </div>
                            {t.login_with_github}
                          </Button>
                      </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      {t.remember_me}
                    </label>
                    <div className="text-sm ml-auto">
                      <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                        {t.forgot_password}
                      </a>
                    </div>
                  </div>

                  {/* Demo Credentials Info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Demo credentials:</strong><br />
                        Email: customer@demo.com<br />
                        Password: customer123
                      </p>
                    </div>
                  )}

                  {/* Sign up link */}
                  <div className="text-center text-sm text-gray-600">
                    {t.no_account}{' '}
                    <button 
                      type="button"
                      onClick={() => setShowRegistration(true)}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      {t.sign_up}
                    </button>
                  </div>
                </form>
              </CardContent>
            </TabsContent>

            {/* Admin Login Tab */}
            <TabsContent value="admin">
              <CardContent className="pt-8 px-8 pb-8">
                <form onSubmit={handleAdminLogin} className="space-y-6">
                  <div>
                    <Label htmlFor="admin-username">Username</Label>
                    <div className="mt-1 relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="admin-username"
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="admin_username"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="mt-1 relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="admin-password"
                        type={showAdminPassword ? "text" : "password"}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
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
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-lg font-medium shadow-lg transform transition-all duration-200 hover:scale-105"
                    disabled={adminLoginMutation.isPending}
                  >
                    {adminLoginMutation.isPending ? 'Signing in...' : t.admin_login_btn}
                  </Button>

                  {/* Demo Credentials Info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Demo credentials:</strong><br />
                        Username: demo_admin<br />
                        Password: demo123
                      </p>
                    </div>
                  )}
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
          ) : (
            // Registration Form
            <CardContent className="pt-8 px-8 pb-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">{t.create_account}</h3>
                <p className="text-sm text-gray-500">{t.sign_in_account}</p>
              </div>
              
              <form onSubmit={handleRegistration} className="space-y-6">
                <div>
                  <Label htmlFor="reg-name" className="text-sm font-medium text-gray-700">{t.full_name}</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="mt-2 py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reg-email" className="text-sm font-medium text-gray-700">{t.your_email}</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu-email@gmail.com"
                    className="mt-2 py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reg-password" className="text-sm font-medium text-gray-700">{t.your_password}</Label>
                  <div className="mt-2 relative">
                    <Input
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="py-3 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                    >
                      {showRegPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reg-confirm-password" className="text-sm font-medium text-gray-700">{t.confirm_password}</Label>
                  <div className="mt-2 relative">
                    <Input
                      id="reg-confirm-password"
                      type={showRegConfirmPassword ? "text" : "password"}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="py-3 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    >
                      {showRegConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms acceptance */}
                <div className="flex items-center">
                  <input
                    id="accept-terms"
                    name="accept-terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900">
                    {t.accept_terms}{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">
                      {t.terms_conditions}
                    </a>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium shadow-lg transform transition-all duration-200 hover:scale-105"
                  disabled={registrationMutation.isPending}
                >
                  {registrationMutation.isPending ? 'Creating account...' : t.create_account_btn}
                </Button>

                {/* Social Registration Options */}
                <div className="space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">{t.or_login_with}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full py-3 border-2 border-gray-200 hover:border-gray-300 rounded-lg flex items-center justify-center gap-3"
                          onClick={() => handleSocialLogin('google')}
                        >
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">G</span>
                          </div>
                          {t.login_with_google}
                        </Button>
                      
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full py-3 border-2 border-gray-200 hover:border-gray-300 rounded-lg flex items-center justify-center gap-3"
                          onClick={() => handleSocialLogin('facebook')}
                        >
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <Facebook className="h-3 w-3 text-white" />
                          </div>
                          {t.login_with_facebook}
                        </Button>
                      
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full py-3 border-2 border-gray-200 hover:border-gray-300 rounded-lg flex items-center justify-center gap-3"
                          onClick={() => handleSocialLogin('github')}
                        >
                          <div className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center">
                            <Github className="h-3 w-3 text-white" />
                          </div>
                          {t.login_with_github}
                        </Button>
                    </div>
                </div>

                {/* Demo Credentials Info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-green-800">
                      <strong>Registration is enabled</strong><br />
                      Create your account and login with your new credentials
                    </p>
                  </div>
                )}

                {/* Back to login link */}
                <div className="text-center text-sm text-gray-600">
                  {t.have_account}{' '}
                  <button 
                    type="button"
                    onClick={() => setShowRegistration(false)}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    {t.sign_in}
                  </button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

          {/* reCAPTCHA Notice */}
          {authSettings?.recaptchaEnabled && (
            <p className="text-xs text-center text-gray-500">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="https://policies.google.com/privacy" className="underline">Privacy Policy</a> and{' '}
              <a href="https://policies.google.com/terms" className="underline">Terms of Service</a> apply.
            </p>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}