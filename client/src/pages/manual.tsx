import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { 
  Bot, 
  Download, 
  Chrome, 
  Settings, 
  Play, 
  Filter,
  Bell,
  ChartLine,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Info,
  Monitor,
  Zap,
  Target,
  RefreshCw
} from "lucide-react";

export default function Manual() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  
  const installationSteps = t.manual?.installationSteps || [
    {
      step: "1",
      title: "Download Extension File",
      description: "After purchasing, download the .crx file from your email confirmation link.",
      details: "Look for an email from OCUS Job Hunter with the subject 'Your Extension is Ready!' and click the download button.",
      icon: Download,
      color: "bg-primary"
    },
    {
      step: "2", 
      title: "Open Chrome Extensions Page",
      description: "Navigate to Chrome Extensions management page.",
      details: "Type 'chrome://extensions/' in your address bar or go to Chrome menu → More tools → Extensions",
      icon: Chrome,
      color: "bg-secondary"
    },
    {
      step: "3",
      title: "Enable Developer Mode",
      description: "Toggle 'Developer mode' switch in the top right corner.",
      details: "This is required to install extensions from .crx files. The toggle should turn blue when enabled.",
      icon: Settings,
      color: "bg-accent",
      warning: true
    },
    {
      step: "4",
      title: "Install Extension",
      description: "Drag and drop the .crx file onto the extensions page.",
      details: "You can also click 'Load unpacked' if the drag-and-drop doesn't work. Chrome will show a confirmation dialog.",
      icon: CheckCircle,
      color: "bg-accent"
    }
  ];

  const usageSteps = (t.manual?.usageSteps || []).map((step, index) => ({
    title: step.title,
    description: step.description,
    icon: [Monitor, Zap, Target, RefreshCw][index] || Monitor,
    tip: step.tip
  }));

  const features = (t.manual?.features || []).map((feature, index) => ({
    title: feature.title,
    description: feature.description,
    icon: [Target, Settings, Bell, Chrome, CheckCircle][index] || Target,
    details: feature.details
  }));

  const troubleshooting = (t.manual?.troubleshooting || []).map((item, index) => ({
    problem: item.problem,
    solution: item.solution,
    severity: ["warning", "info", "warning", "info"][index] || "info"
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-4"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.manual?.backToHome || "Back to Home"}
              </Button>
              <Bot className="text-2xl text-primary mr-3" />
              <span className="text-xl font-bold text-slate-900">{t.manual?.title || "OCUS Job Hunter Manual"}</span>
            </div>
            <div className="flex items-center">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-accent/10 text-accent mb-6">
            <Bot className="w-4 h-4 mr-2" />
            {t.manual?.badge || "Complete User Guide"}
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            {t.manual?.heroTitle || "OCUS Job Hunter"}
            <span className="text-primary"> {t.manual?.heroSubtitle || "User Manual"}</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            {t.manual?.heroDescription || "Everything you need to know to install, configure, and get the most out of your OCUS Job Hunter Chrome extension."}
          </p>
          <div className="flex justify-center space-x-4">
            <a href="#installation">
              <Button size="lg" className="bg-primary text-white hover:bg-secondary">
                <Play className="mr-2 h-4 w-4" />
                {t.manual?.getStartedButton || "Get Started"}
              </Button>
            </a>
            <Link href="/checkout">
              <Button variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:border-primary hover:bg-primary hover:text-white">
                <Download className="mr-2 h-4 w-4" />
                {t.manual?.purchaseButton || "Purchase Extension"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section id="installation" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t.manual?.installationTitle || "Installation Guide"}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t.manual?.installationDescription || "Follow these simple steps to install your OCUS Job Hunter extension in less than 2 minutes"}
            </p>
          </div>

          <div className="space-y-8">
            {installationSteps.map((step, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${step.color} text-white rounded-xl flex items-center justify-center font-bold text-xl`}>
                          {step.step}
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-slate-900">{step.title}</h3>
                          {step.warning && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-1">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Important
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-lg text-slate-600">{step.description}</p>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-700">{step.details}</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className={`w-32 h-32 bg-primary/10 rounded-2xl flex items-center justify-center`}>
                        {i === 0 && <Download className="h-16 w-16 text-slate-600" />}
                        {i === 1 && <Chrome className="h-16 w-16 text-slate-600" />}
                        {i === 2 && <Settings className="h-16 w-16 text-slate-600" />}
                        {i === 3 && <CheckCircle className="h-16 w-16 text-slate-600" />}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Usage Guide */}
      <section id="usage" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t.manual?.usageTitle || "How to Use"}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t.manual?.usageDescription || "Start finding your dream job automatically with these easy steps"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {usageSteps.map((step, i) => (
              <Card key={i} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-xl mb-6">
                    {i === 0 && <Monitor className="h-8 w-8" />}
                    {i === 1 && <Zap className="h-8 w-8" />}
                    {i === 2 && <Target className="h-8 w-8" />}
                    {i === 3 && <RefreshCw className="h-8 w-8" />}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">{step.title}</h3>
                  <p className="text-slate-600 mb-4">{step.description}</p>
                  {step.tip && (
                    <div className="bg-accent/10 rounded-lg p-3">
                      <p className="text-sm text-accent font-medium">💡 {step.tip}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t.manual?.featuresTitle || "Feature Overview"}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t.manual?.featuresDescription || "Detailed breakdown of all the powerful features at your disposal"}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="p-8">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      {i === 0 && <Target className="h-6 w-6" />}
                      {i === 1 && <Settings className="h-6 w-6" />}
                      {i === 2 && <Bell className="h-6 w-6" />}
                      {i === 3 && <Chrome className="h-6 w-6" />}
                      {i === 4 && <CheckCircle className="h-6 w-6" />}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <p className="text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.details.map((detail, j) => (
                      <li key={j} className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-accent mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section id="troubleshooting" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t.manual?.troubleshootingTitle || "Troubleshooting"}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t.manual?.troubleshootingDescription || "Common issues and their solutions"}
            </p>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {troubleshooting.map((item, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {item.severity === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <Info className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">{item.problem}</h3>
                    <p className="text-slate-600">{item.solution}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Card className="inline-block p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Still Need Help?</h3>
              <p className="text-slate-600 mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Button className="bg-primary text-white hover:bg-secondary">
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}