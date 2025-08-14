import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft, Shield } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.privacy.backToHome}
                </Button>
              </Link>
              <Shield className="text-2xl text-primary mr-3" />
              <span className="text-xl font-bold text-slate-900">{t.privacy.title}</span>
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
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Privacy & Security
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            {t.privacy.title}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-4">
            Your privacy and data security are our top priorities. Learn how we protect your information.
          </p>
          <p className="text-sm text-slate-500">
            {t.privacy.lastUpdated}: {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">

        {/* Privacy Policy Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                {t.privacy.introduction.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.privacy.introduction.content}
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                {t.privacy.dataCollection.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t.privacy.dataCollection.personalInfo.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {t.privacy.dataCollection.personalInfo.content}
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-1">
                  <li>{t.privacy.dataCollection.personalInfo.email}</li>
                  <li>{t.privacy.dataCollection.personalInfo.name}</li>
                  <li>{t.privacy.dataCollection.personalInfo.phone}</li>
                  <li>{t.privacy.dataCollection.personalInfo.country}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t.privacy.dataCollection.usageData.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {t.privacy.dataCollection.usageData.content}
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-1">
                  <li>{t.privacy.dataCollection.usageData.extensionUsage}</li>
                  <li>{t.privacy.dataCollection.usageData.featureInteraction}</li>
                  <li>{t.privacy.dataCollection.usageData.performanceMetrics}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t.privacy.dataCollection.paymentData.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {t.privacy.dataCollection.paymentData.content}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                {t.privacy.dataUsage.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t.privacy.dataUsage.content}
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>{t.privacy.dataUsage.provideService}</li>
                <li>{t.privacy.dataUsage.processPayments}</li>
                <li>{t.privacy.dataUsage.customerSupport}</li>
                <li>{t.privacy.dataUsage.improveService}</li>
                <li>{t.privacy.dataUsage.sendUpdates}</li>
                <li>{t.privacy.dataUsage.preventFraud}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing and Disclosure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                {t.privacy.dataSharing.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t.privacy.dataSharing.content}
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t.privacy.dataSharing.serviceProviders.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t.privacy.dataSharing.serviceProviders.content}
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                    <li>{t.privacy.dataSharing.serviceProviders.stripe}</li>
                    <li>{t.privacy.dataSharing.serviceProviders.paypal}</li>
                    <li>{t.privacy.dataSharing.serviceProviders.emailService}</li>
                    <li>{t.privacy.dataSharing.serviceProviders.analytics}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t.privacy.dataSharing.legalRequirements.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t.privacy.dataSharing.legalRequirements.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                {t.privacy.dataSecurity.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t.privacy.dataSecurity.content}
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>{t.privacy.dataSecurity.encryption}</li>
                <li>{t.privacy.dataSecurity.accessControls}</li>
                <li>{t.privacy.dataSecurity.regularAudits}</li>
                <li>{t.privacy.dataSecurity.secureServers}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                {t.privacy.userRights.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t.privacy.userRights.content}
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>{t.privacy.userRights.access}</li>
                <li>{t.privacy.userRights.correction}</li>
                <li>{t.privacy.userRights.deletion}</li>
                <li>{t.privacy.userRights.portability}</li>
                <li>{t.privacy.userRights.objection}</li>
                <li>{t.privacy.userRights.restriction}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                {t.privacy.cookies.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t.privacy.cookies.content}
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t.privacy.cookies.essential.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {t.privacy.cookies.essential.content}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t.privacy.cookies.analytics.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {t.privacy.cookies.analytics.content}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t.privacy.cookies.marketing.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {t.privacy.cookies.marketing.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                {t.privacy.internationalTransfers.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">
                {t.privacy.internationalTransfers.content}
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                {t.privacy.dataRetention.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t.privacy.dataRetention.content}
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-1">
                <li>{t.privacy.dataRetention.accountData}</li>
                <li>{t.privacy.dataRetention.transactionData}</li>
                <li>{t.privacy.dataRetention.supportData}</li>
                <li>{t.privacy.dataRetention.marketingData}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                {t.privacy.childrenPrivacy.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">
                {t.privacy.childrenPrivacy.content}
              </p>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                {t.privacy.changes.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">
                {t.privacy.changes.content}
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                {t.privacy.contact.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t.privacy.contact.content}
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  OCUS Job Hunter
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                  <span className="block">Email: info@logoland.se</span>
                  <span className="block">Website: www.jobhunter.one</span>
                  <span className="block">{t.privacy.contact.address}</span>
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <Link href="/">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              {t.privacy.backToHome}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}