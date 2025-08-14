import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GDPRNotice } from "@/components/GDPRNotice";
import Login from "@/pages/login";
import UnifiedLogin from "@/pages/unified-login";
import SimpleTest from "@/pages/simple-test";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Checkout from "@/pages/checkout";
import DebugActivation from "@/pages/debug-activation";
import DownloadExtension from "@/pages/download-extension";
import Manual from "@/pages/manual";
import Admin from "@/pages/admin";
import Support from "@/pages/support";
import Dashboard from "@/pages/dashboard";
import AffiliatePage from "./pages/affiliate";
import AdminAffiliatesPage from "./pages/admin-affiliates";
import PrivacyPolicy from "./pages/privacy-policy";
import LegalPage from "./pages/legal";
import ExtensionDownloads from "./pages/ExtensionDownloads";
import Invoices from "./pages/invoices";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/manual" component={Manual} />
      <Route path="/admin" component={Admin} />
      <Route path="/support" component={Support} />
      <Route path="/login" component={UnifiedLogin} />
      <Route path="/unified-login" component={UnifiedLogin} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/affiliate" component={AffiliatePage} />
      <Route path="/admin/affiliates" component={AdminAffiliatesPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/legal" component={LegalPage} />
      <Route path="/test" component={SimpleTest} />
      <Route path="/debug-activation" component={DebugActivation} />
      <Route path="/download-extension" component={DownloadExtension} />
      <Route path="/extensions" component={ExtensionDownloads} />
      <Route path="/invoices" component={Invoices} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <GDPRNotice />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
