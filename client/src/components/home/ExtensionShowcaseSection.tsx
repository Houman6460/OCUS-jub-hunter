import React from 'react';
import ocusUnifiedExtensionNew from '@/assets/ocus-unified-extension-new.webp';
import ocusHunterNew from '@/assets/ocus-hunter-new.webp';
import './../../pages/home.css';

interface ExtensionShowcaseSectionProps {
  t: (key: string) => string;
}

export default function ExtensionShowcaseSection({ t }: ExtensionShowcaseSectionProps) {
  return (
    <section className="py-20 bg-slate-50 banner-aware-additional-spacing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            {t?.('extensionShowcaseTitle') || 'Premium OCUS Job Hunter Extension'}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-4">
            {t?.('extensionShowcaseSubtitle') || 'Complete automation for OCUS photography jobs with intelligent monitoring and seamless workflow management'}
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 text-center">
              {t?.('extensionHowItWorksTitle') || '🎯 How the Premium Extension Works'}
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-blue-600 font-semibold mb-1">{t?.('extensionAutoLoginTitle') || '🔐 Auto-Login'}</div>
                <p className="text-slate-600">{t?.('extensionAutoLoginDescription') || 'Uses your OCUS credentials to automatically log you back in when sessions expire'}</p>
              </div>
              <div className="text-center">
                <div className="text-green-600 font-semibold mb-1">{t?.('extension24MonitoringTitle') || '🕐 24/7 Monitoring'}</div>
                <p className="text-slate-600">{t?.('extension24MonitoringDescription') || 'After accepting missions, returns to home page to continue monitoring for new opportunities'}</p>
              </div>
              <div className="text-center">
                <div className="text-purple-600 font-semibold mb-1">{t?.('extensionSmartTimerTitle') || '⚡ Smart Timer'}</div>
                <p className="text-slate-600">{t?.('extensionSmartTimerDescription') || 'Customizable refresh intervals (5-30 seconds) with floating panel controls and performance tracking'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <h3 className="text-xl font-bold text-slate-900 text-center md:col-span-1">{t?.('floatingPanelTitle') || 'Floating OCUS Hunter Panel'}</h3>
            <h3 className="text-xl font-bold text-slate-900 text-center md:col-span-1">{t?.('extensionPopupTitle') || 'Extension Popup Interface'}</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start mt-4">
            {/* Left Image Panel */}
            <div className="flex justify-center items-start max-w-xs mx-auto">
              <img 
                src={ocusHunterNew} 
                alt="OCUS Hunter Panel Preview" 
                className="rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            {/* Right Image Panel */}
            <div className="flex justify-center items-start max-w-xs mx-auto overflow-hidden rounded-lg">
              <div className="image-scroll-container rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                <img 
                  src={ocusUnifiedExtensionNew} 
                  alt="OCUS Unified Extension Panel Preview" 
                  className="image-scroll-content"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start mt-4">
            {/* Left Text Box */}
            <div className="max-w-xs mx-auto w-full">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">Floating Control Panel</h4>
                <p className="text-blue-800 text-xs leading-relaxed">
                  {t?.('floatingPanelDescription') || 'The floating panel gives you at-a-glance status updates. It shows login counts, mission status, and a countdown timer for the next refresh, ensuring you are always informed without interrupting your workflow.'}
                </p>
              </div>
            </div>

            {/* Right Text Box */}
            <div className="max-w-xs mx-auto w-full">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2 text-sm">Advanced Popup Interface</h4>
                <p className="text-green-800 text-xs leading-relaxed">
                  {t?.('extensionPopupDescription') || 'The extension popup is your command center. It provides detailed information about your missions, auto-login credentials, and configuration settings for refresh intervals and notifications.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
