import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ArrowRight, CheckCircle, Chrome, CreditCard, Download, Key, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface FirstVisitGuideProps {
  onClose: () => void;
  onStepComplete: (step: number) => void;
  customerData: any;
}

export default function FirstVisitGuide({ onClose, onStepComplete, customerData }: FirstVisitGuideProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Fetch current pricing from admin settings
  const { data: pricingData } = useQuery({
    queryKey: ['/api/products/pricing'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/products/pricing');
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds to stay in sync
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const steps = [
    {
      id: 1,
      title: "Welcome to OCUS Job Hunter",
      description: "Your premium Chrome extension for food delivery optimization",
      icon: Chrome,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            OCUS Job Hunter helps delivery drivers find the most profitable jobs by monitoring
            Uber Eats, Foodora, and other platforms automatically.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">What you'll get:</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Automatic job monitoring and filtering</li>
              <li>• Real-time high-value order notifications</li>
              <li>• Geographic area customization</li>
              <li>• Performance analytics and earnings tracking</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Purchase Your License",
      description: "One-time payment for lifetime access",
      icon: CreditCard,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Your account is currently on the trial version (3 free job scans). 
            Purchase the full version to unlock unlimited monitoring.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">
              Special Price: €{pricingData?.price || '29.99'}
            </h4>
            <p className="text-green-800 text-sm">
              {pricingData?.beforePrice && parseFloat(pricingData.beforePrice) > parseFloat(pricingData.price) ? (
                <>Normally €{pricingData.beforePrice} - Get lifetime access with this exclusive discount!</>
              ) : (
                'Get lifetime access to unlimited job monitoring!'
              )}
            </p>
          </div>
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => window.location.href = '/checkout'}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Purchase Now
          </Button>
        </div>
      )
    },
    {
      id: 3,
      title: "Scratch & Reveal Your Key",
      description: "Interactive lottery system to reveal activation key",
      icon: Key,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            After payment, you'll get access to our fun lottery scratch card system
            where you can reveal your unique activation key!
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">Lottery Experience:</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Interactive scratch card interface</li>
              <li>• Your unique activation key hidden underneath</li>
              <li>• Immediate activation after revealing</li>
              <li>• Fun gamified experience</li>
            </ul>
          </div>
          {customerData?.totalSpent > 0 && !customerData?.activationKeyRevealed && (
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => window.location.href = '/dashboard#activation'}
            >
              <Key className="h-4 w-4 mr-2" />
              Scratch Your Card Now!
            </Button>
          )}
        </div>
      )
    },
    {
      id: 4,
      title: "Download & Install",
      description: "Get your Chrome extension file",
      icon: Download,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Once activated, download the .crx extension file and install it in Chrome.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Installation Steps:</h4>
            <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
              <li>Download the .crx file from your dashboard</li>
              <li>Open Chrome Extensions (chrome://extensions/)</li>
              <li>Enable "Developer mode"</li>
              <li>Drag and drop the .crx file</li>
              <li>Enter your activation key in extension settings</li>
            </ol>
          </div>
          {customerData?.extensionActivated && (
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.href = '/dashboard#extension'}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Extension
            </Button>
          )}
        </div>
      )
    },
    {
      id: 5,
      title: "Start Earning More",
      description: "Begin monitoring profitable delivery jobs",
      icon: Play,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Your OCUS Job Hunter is ready! Start monitoring delivery platforms 
            and maximize your earnings with smart job selection.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">You're all set!</h4>
            <p className="text-green-800 text-sm">
              The extension will automatically scan for high-value orders and notify you 
              when profitable jobs become available in your area.
            </p>
          </div>
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => {
              localStorage.setItem('first-visit-guide-completed', 'true');
              onClose();
            }}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Setup
          </Button>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
        onStepComplete(currentStep);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps.find(step => step.id === currentStep);
  if (!currentStepData) return null;

  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              <p className="text-gray-600 text-sm">{currentStepData.description}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  completedSteps.includes(step.id) 
                    ? 'bg-green-600 text-white' 
                    : step.id === currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    completedSteps.includes(step.id) ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <Badge variant="outline" className="w-fit">
            Step {currentStep} of {steps.length}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStepData.content}
          
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Skip Guide
              </Button>
              {currentStep < steps.length && (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}