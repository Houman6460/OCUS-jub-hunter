import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'none';
  nextButton?: string;
  skipButton?: boolean;
}

interface TutorialTooltipProps {
  steps: TutorialStep[];
  isActive: boolean;
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function TutorialTooltip({
  steps,
  isActive,
  currentStep,
  onNext,
  onPrevious,
  onSkip,
  onComplete
}: TutorialTooltipProps) {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const targetElement = document.querySelector(currentStepData.target);
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // Set highlight position
    setHighlightPosition({
      top: rect.top + scrollTop - 4,
      left: rect.left + scrollLeft - 4,
      width: rect.width + 8,
      height: rect.height + 8
    });

    // Calculate tooltip position
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    let top = 0;
    let left = 0;

    switch (currentStepData.position || 'bottom') {
      case 'top':
        top = rect.top + scrollTop - tooltipHeight - 16;
        left = rect.left + scrollLeft + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + scrollTop + 16;
        left = rect.left + scrollLeft + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + scrollTop + rect.height / 2 - tooltipHeight / 2;
        left = rect.left + scrollLeft - tooltipWidth - 16;
        break;
      case 'right':
        top = rect.top + scrollTop + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + scrollLeft + 16;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 10) left = 10;
    if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
    if (top < 10) top = 10;
    if (top + tooltipHeight > viewportHeight + scrollTop - 10) {
      top = viewportHeight + scrollTop - tooltipHeight - 10;
    }

    setTooltipPosition({ top, left });

    // Scroll element into view if needed
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }, [currentStep, isActive, currentStepData]);

  if (!isActive || !currentStepData) return null;

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" />
      
      {/* Highlight */}
      <div
        className="fixed bg-white/10 border-2 border-primary rounded-lg z-50 pointer-events-none transition-all duration-300"
        style={{
          top: highlightPosition.top,
          left: highlightPosition.left,
          width: highlightPosition.width,
          height: highlightPosition.height,
          boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)'
        }}
      />

      {/* Tooltip */}
      <Card
        ref={tooltipRef}
        className="fixed z-50 w-80 shadow-2xl border-primary/20"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-primary mb-1">
                {currentStepData.title}
              </h3>
              <div className="text-xs text-muted-foreground mb-2">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="p-1 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {currentStepData.content}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrevious}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {currentStepData.skipButton !== false && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  className="text-muted-foreground"
                >
                  Skip Tutorial
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={isLastStep ? onComplete : onNext}
                className="flex items-center gap-1"
              >
                {currentStepData.nextButton || (isLastStep ? 'Finish' : 'Next')}
                {!isLastStep && <ArrowRight className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Hook for managing tutorial state
export function useTutorial(tutorialKey: string, steps: TutorialStep[]) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(`tutorial_${tutorialKey}`);
    if (!hasSeenTutorial) {
      // Small delay to ensure page is loaded
      setTimeout(() => setIsActive(true), 500);
    }
  }, [tutorialKey]);

  const startTutorial = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    localStorage.setItem(`tutorial_${tutorialKey}`, 'completed');
    setIsActive(false);
    setCurrentStep(0);
  };

  const completeTutorial = () => {
    localStorage.setItem(`tutorial_${tutorialKey}`, 'completed');
    setIsActive(false);
    setCurrentStep(0);
  };

  const resetTutorial = () => {
    localStorage.removeItem(`tutorial_${tutorialKey}`);
    setCurrentStep(0);
  };

  return {
    isActive,
    currentStep,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    resetTutorial
  };
}