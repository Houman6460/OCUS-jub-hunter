import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { ArrowLeft, ChevronDown, Shield, RefreshCw, FileText, Globe, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LegalPage() {
  const { t, currentLanguage, setLanguage, languages } = useLanguage();

  // Add safety check for translations
  if (!t?.legal || !languages) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Loading...</p>
    </div>;
  }
  const [activeSection, setActiveSection] = useState<string>('privacy');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Handle anchor navigation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['privacy', 'refund', 'terms'].includes(hash)) {
      setActiveSection(hash);
      // Auto-open the section
      setOpenSections(prev => ({ ...prev, [hash]: true }));
      // Scroll to the section after a short delay
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    }
  }, []);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* GDPR Notice */}
        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                GDPR Compliance
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                {t.legal.gdprNotice}. <Link href="#privacy" className="underline hover:no-underline">Learn more</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" className="mb-2 sm:mb-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.legal.backToHome}
              </Button>
            </Link>
            
            {/* Language Switcher */}
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Select value={currentLanguage} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t.legal.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t.legal.lastUpdated}: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeSection === 'privacy' ? 'default' : 'outline'}
              onClick={() => scrollToSection('privacy')}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {t.legal.privacyPolicy}
            </Button>
            <Button
              variant={activeSection === 'refund' ? 'default' : 'outline'}
              onClick={() => scrollToSection('refund')}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t.legal.refundPolicy}
            </Button>
            <Button
              variant={activeSection === 'terms' ? 'default' : 'outline'}
              onClick={() => scrollToSection('terms')}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {t.legal.termsOfService}
            </Button>
          </div>
        </div>

        {/* Legal Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Privacy Policy Section */}
          <section id="privacy" className="scroll-mt-8">
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                <CardTitle className="text-2xl text-blue-600 dark:text-blue-400 flex items-center gap-3">
                  <Shield className="w-6 h-6" />
                  {t.privacy.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                
                {/* Privacy Introduction */}
                <Collapsible open={openSections.privacyIntro} onOpenChange={() => toggleSection('privacyIntro')}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t.privacy.introduction.title}
                    </h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.privacyIntro ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      {t.privacy.introduction.content}
                    </p>
                  </CollapsibleContent>
                </Collapsible>

                {/* Data Collection */}
                <Collapsible open={openSections.dataCollection} onOpenChange={() => toggleSection('dataCollection')}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t.privacy.dataCollection.title}
                    </h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.dataCollection ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4 space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t.privacy.dataCollection.personalInfo.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {t.privacy.dataCollection.personalInfo.content}
                      </p>
                      <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 text-sm space-y-1">
                        <li>{t.privacy.dataCollection.personalInfo.email}</li>
                        <li>{t.privacy.dataCollection.personalInfo.name}</li>
                        <li>{t.privacy.dataCollection.personalInfo.phone}</li>
                        <li>{t.privacy.dataCollection.personalInfo.country}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t.privacy.dataCollection.usageData.title}
                      </h4>
                      <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 text-sm space-y-1">
                        <li>{t.privacy.dataCollection.usageData.extensionUsage}</li>
                        <li>{t.privacy.dataCollection.usageData.featureInteraction}</li>
                        <li>{t.privacy.dataCollection.usageData.performanceMetrics}</li>
                      </ul>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Continue with more privacy sections... */}
                <Collapsible open={openSections.dataUsage} onOpenChange={() => toggleSection('dataUsage')}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t.privacy.dataUsage.title}
                    </h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.dataUsage ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 text-sm space-y-1">
                      <li>{t.privacy.dataUsage.provideService}</li>
                      <li>{t.privacy.dataUsage.processPayments}</li>
                      <li>{t.privacy.dataUsage.customerSupport}</li>
                      <li>{t.privacy.dataUsage.improveService}</li>
                    </ul>
                  </CollapsibleContent>
                </Collapsible>

              </CardContent>
            </Card>
          </section>

          {/* Refund Policy Section */}
          <section id="refund" className="scroll-mt-8">
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader className="bg-green-50 dark:bg-green-900/20">
                <CardTitle className="text-2xl text-green-600 dark:text-green-400 flex items-center gap-3">
                  <RefreshCw className="w-6 h-6" />
                  {t.refund.title}
                  <span className="text-sm bg-green-100 dark:bg-green-800 px-2 py-1 rounded-full">
                    {t.refund.subtitle}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">

                {/* Refund Introduction */}
                <Collapsible open={openSections.refundIntro} onOpenChange={() => toggleSection('refundIntro')}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t.refund.introduction.title}
                    </h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.refundIntro ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      {t.refund.introduction.content}
                    </p>
                  </CollapsibleContent>
                </Collapsible>

                {/* Eligibility */}
                <Collapsible open={openSections.eligibility} onOpenChange={() => toggleSection('eligibility')}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t.refund.eligibility.title}
                    </h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.eligibility ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {t.refund.eligibility.content}
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 text-sm space-y-1">
                      <li>{t.refund.eligibility.within30Days}</li>
                      <li>{t.refund.eligibility.originalPurchaser}</li>
                      <li>{t.refund.eligibility.validReason}</li>
                      <li>{t.refund.eligibility.noAbuse}</li>
                    </ul>
                  </CollapsibleContent>
                </Collapsible>

                {/* Process */}
                <Collapsible open={openSections.process} onOpenChange={() => toggleSection('process')}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t.refund.process.title}
                    </h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.process ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {t.refund.process.content}
                    </p>
                    <ol className="list-decimal pl-6 text-gray-600 dark:text-gray-400 text-sm space-y-1">
                      <li>{t.refund.process.step1}</li>
                      <li>{t.refund.process.step2}</li>
                      <li>{t.refund.process.step3}</li>
                      <li>{t.refund.process.step4}</li>
                      <li>{t.refund.process.step5}</li>
                    </ol>
                  </CollapsibleContent>
                </Collapsible>

              </CardContent>
            </Card>
          </section>

          {/* Terms of Service Section */}
          <section id="terms" className="scroll-mt-8">
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
                <CardTitle className="text-2xl text-purple-600 dark:text-purple-400 flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  {t.terms.title}
                  <span className="text-sm bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded-full">
                    {t.terms.subtitle}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">

                {/* Terms Acceptance */}
                <Collapsible open={openSections.acceptance} onOpenChange={() => toggleSection('acceptance')}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t.terms.acceptance.title}
                    </h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.acceptance ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      {t.terms.acceptance.content}
                    </p>
                  </CollapsibleContent>
                </Collapsible>

                {/* Service Description */}
                <Collapsible open={openSections.serviceDescription} onOpenChange={() => toggleSection('serviceDescription')}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t.terms.serviceDescription.title}
                    </h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.serviceDescription ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {t.terms.serviceDescription.content}
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 text-sm space-y-1">
                      <li>{t.terms.serviceDescription.feature1}</li>
                      <li>{t.terms.serviceDescription.feature2}</li>
                      <li>{t.terms.serviceDescription.feature3}</li>
                      <li>{t.terms.serviceDescription.feature4}</li>
                    </ul>
                  </CollapsibleContent>
                </Collapsible>

                {/* User Responsibilities */}
                <Collapsible open={openSections.userResponsibilities} onOpenChange={() => toggleSection('userResponsibilities')}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t.terms.userResponsibilities.title}
                    </h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.userResponsibilities ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {t.terms.userResponsibilities.content}
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 text-sm space-y-1">
                      <li>{t.terms.userResponsibilities.responsible1}</li>
                      <li>{t.terms.userResponsibilities.responsible2}</li>
                      <li>{t.terms.userResponsibilities.responsible3}</li>
                      <li>{t.terms.userResponsibilities.responsible4}</li>
                    </ul>
                  </CollapsibleContent>
                </Collapsible>

                {/* Prohibited Activities */}
                <Collapsible open={openSections.prohibited} onOpenChange={() => toggleSection('prohibited')}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t.terms.prohibited.title}
                    </h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openSections.prohibited ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {t.terms.prohibited.content}
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 text-sm space-y-1">
                      <li>{t.terms.prohibited.prohibited1}</li>
                      <li>{t.terms.prohibited.prohibited2}</li>
                      <li>{t.terms.prohibited.prohibited3}</li>
                      <li>{t.terms.prohibited.prohibited4}</li>
                    </ul>
                  </CollapsibleContent>
                </Collapsible>

              </CardContent>
            </Card>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <Link href="/">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.legal.backToHome}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}