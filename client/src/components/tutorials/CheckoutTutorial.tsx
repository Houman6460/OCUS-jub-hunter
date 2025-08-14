import React from 'react';
import { TutorialTooltip, useTutorial } from '@/components/TutorialTooltip';

const CHECKOUT_STEPS = [
  {
    id: 'product-overview',
    target: '[data-tutorial="product-summary"]',
    title: 'Product Overview',
    content: 'Here\'s what you\'re purchasing: the OCUS Job Hunter Chrome extension with lifetime access and all premium features included.',
    position: 'bottom' as const
  },
  {
    id: 'pricing-info',
    target: '[data-tutorial="pricing-breakdown"]',
    title: 'Pricing Breakdown',
    content: 'This shows your total cost. You can apply coupon codes here for discounts. The price updates in real-time!',
    position: 'top' as const
  },
  {
    id: 'customer-info',
    target: '[data-tutorial="customer-form"]',
    title: 'Your Information',
    content: 'Fill in your details here. We\'ll send your activation key and download instructions to this email address.',
    position: 'left' as const
  },
  {
    id: 'coupon-code',
    target: '[data-tutorial="coupon-field"]',
    title: 'Got a Coupon?',
    content: 'If you have a discount code, enter it here. The discount will be applied automatically and shown in the pricing breakdown.',
    position: 'top' as const
  },
  {
    id: 'payment-methods',
    target: '[data-tutorial="payment-tabs"]',
    title: 'Choose Your Payment',
    content: 'We accept both Stripe (credit cards) and PayPal. Choose whichever is more convenient for you.',
    position: 'top' as const
  },
  {
    id: 'secure-payment',
    target: '[data-tutorial="security-badge"]',
    title: 'Secure & Protected',
    content: 'Your payment is secured with SSL encryption. We never store your payment details - everything is processed securely.',
    position: 'top' as const
  }
];

interface CheckoutTutorialProps {
  shouldStart?: boolean;
}

export function CheckoutTutorial({ shouldStart }: CheckoutTutorialProps) {
  const tutorial = useTutorial('checkout', CHECKOUT_STEPS);

  React.useEffect(() => {
    if (shouldStart) {
      tutorial.startTutorial();
    }
  }, [shouldStart]);

  return (
    <TutorialTooltip
      steps={CHECKOUT_STEPS}
      isActive={tutorial.isActive}
      currentStep={tutorial.currentStep}
      onNext={tutorial.nextStep}
      onPrevious={tutorial.previousStep}
      onSkip={tutorial.skipTutorial}
      onComplete={tutorial.completeTutorial}
    />
  );
}