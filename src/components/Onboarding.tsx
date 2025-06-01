import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from './ui/Button';

interface OnboardingStep {
  title: string;
  content: string[];
  image?: string;
  action?: {
    label: string;
    path: string;
  };
}

const Onboarding: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      title: t('onboarding.welcome.title'),
      content: [t('onboarding.welcome.subtitle')],
      image: '/images/mascot.png'
    },
    {
      title: t('onboarding.features.title'),
      content: t('onboarding.features.items', { returnObjects: true }) as string[],
    },
    {
      title: t('onboarding.setup.title'),
      content: [t('onboarding.setup.subtitle')],
      action: {
        label: t('onboarding.setup.complete'),
        path: '/profile'
      }
    }
  ];

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Omitir introducción"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {currentStepData.image && (
            <div className="flex justify-center mb-4">
              <img 
                src={currentStepData.image} 
                alt="DoctorMX Mascot" 
                className="w-32 h-32 object-contain"
              />
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-center text-gray-900">
            {currentStepData.title}
          </h2>
          
          {Array.isArray(currentStepData.content) && currentStepData.content.length === 1 ? (
            <p className="text-center text-gray-600">
              {currentStepData.content[0]}
            </p>
          ) : Array.isArray(currentStepData.content) ? (
            <ul className="space-y-2">
              {currentStepData.content.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-600">
              {currentStepData.content}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft size={16} />
            {t('common.previous')}
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('onboarding.setup.skip')}
            </button>
            
            <Button
              onClick={handleNext}
              className="flex items-center gap-1"
            >
              {currentStep === steps.length - 1 ? (
                t('onboarding.setup.complete')
              ) : (
                <>
                  {t('common.next')}
                  <ChevronRight size={16} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;