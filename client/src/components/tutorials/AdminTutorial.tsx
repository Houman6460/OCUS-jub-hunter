import React from 'react';
import { TutorialTooltip, useTutorial } from '@/components/TutorialTooltip';

const ADMIN_STEPS = [
  {
    id: 'admin-welcome',
    target: '[data-tutorial="admin-header"]',
    title: 'Admin Dashboard Overview',
    content: 'Welcome to the admin dashboard! Here you can manage your entire OCUS Job Hunter business - from analytics to user management.',
    position: 'bottom' as const
  },
  {
    id: 'analytics-cards',
    target: '[data-tutorial="analytics-cards"]',
    title: 'Key Metrics at a Glance',
    content: 'These cards show your most important business metrics: total revenue, active users, conversion rates, and growth trends.',
    position: 'bottom' as const
  },
  {
    id: 'revenue-chart',
    target: '[data-tutorial="revenue-chart"]',
    title: 'Revenue Analytics',
    content: 'Track your revenue over time with this interactive chart. You can see daily, weekly, and monthly trends to understand your business growth.',
    position: 'top' as const
  },
  {
    id: 'pricing-management',
    target: '[data-tutorial="pricing-section"]',
    title: 'Dynamic Pricing Control',
    content: 'Adjust your product pricing here. Changes update across the entire platform in real-time, including the checkout page.',
    position: 'top' as const
  },
  {
    id: 'users-tab',
    target: '[data-tutorial="users-tab"]',
    title: 'User Management',
    content: 'Monitor all your users here: see trial usage, activation status, and perform bulk actions like regenerating codes or blocking accounts.',
    position: 'right' as const
  },
  {
    id: 'sidebar-navigation',
    target: '[data-tutorial="admin-sidebar"]',
    title: 'Admin Navigation',
    content: 'Use this sidebar to navigate between different admin sections: Analytics, Users, Payments, Chat support, and File management.',
    position: 'right' as const
  }
];

interface AdminTutorialProps {
  shouldStart?: boolean;
}

export function AdminTutorial({ shouldStart }: AdminTutorialProps) {
  const tutorial = useTutorial('admin', ADMIN_STEPS);

  React.useEffect(() => {
    if (shouldStart) {
      tutorial.startTutorial();
    }
  }, [shouldStart]);

  return (
    <TutorialTooltip
      steps={ADMIN_STEPS}
      isActive={tutorial.isActive}
      currentStep={tutorial.currentStep}
      onNext={tutorial.nextStep}
      onPrevious={tutorial.previousStep}
      onSkip={tutorial.skipTutorial}
      onComplete={tutorial.completeTutorial}
    />
  );
}