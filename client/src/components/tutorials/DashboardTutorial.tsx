import React from 'react';
import { TutorialTooltip, useTutorial } from '@/components/TutorialTooltip';

const DASHBOARD_STEPS = [
  {
    id: 'welcome',
    target: '[data-tutorial="dashboard-header"]',
    title: 'Welcome to OCUS Job Hunter!',
    content: 'This is your dashboard where you can manage your extension, view orders, and download the latest version. Let\'s take a quick tour!',
    position: 'bottom' as const,
    nextButton: 'Start Tour'
  },
  {
    id: 'extension-download',
    target: '[data-tutorial="extension-download"]',
    title: 'Download Your Extension',
    content: 'Here you can download the latest version of the OCUS Job Hunter Chrome extension. The version updates automatically when new features are added.',
    position: 'top' as const
  },
  {
    id: 'activation-key',
    target: '[data-tutorial="activation-key"]',
    title: 'Your Activation Key',
    content: 'Scratch to reveal your activation key! This unlocks unlimited job searches. Without activation, you get 3 free trial searches.',
    position: 'bottom' as const
  },
  {
    id: 'installation-guide',
    target: '[data-tutorial="installation-guide"]',
    title: 'Installation Instructions',
    content: 'Follow these step-by-step instructions to install your extension. Don\'t worry - it\'s easier than it looks!',
    position: 'top' as const
  },
  {
    id: 'sidebar-navigation',
    target: '[data-tutorial="sidebar-nav"]',
    title: 'Navigate Your Account',
    content: 'Use this sidebar to access different sections: view your profile, check orders, manage preferences, and get support.',
    position: 'right' as const
  },
  {
    id: 'support-section',
    target: '[data-tutorial="support-link"]',
    title: 'Need Help?',
    content: 'Having issues? Click here to access our support system, submit tickets, or chat with our AI assistant.',
    position: 'left' as const
  }
];

interface DashboardTutorialProps {
  shouldStart?: boolean;
}

export function DashboardTutorial({ shouldStart }: DashboardTutorialProps) {
  const tutorial = useTutorial('dashboard', DASHBOARD_STEPS);

  // Start tutorial if requested
  React.useEffect(() => {
    if (shouldStart) {
      tutorial.startTutorial();
    }
  }, [shouldStart]);

  return (
    <TutorialTooltip
      steps={DASHBOARD_STEPS}
      isActive={tutorial.isActive}
      currentStep={tutorial.currentStep}
      onNext={tutorial.nextStep}
      onPrevious={tutorial.previousStep}
      onSkip={tutorial.skipTutorial}
      onComplete={tutorial.completeTutorial}
    />
  );
}