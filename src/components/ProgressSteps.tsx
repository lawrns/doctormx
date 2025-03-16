import { Check } from 'lucide-react';

type Step = {
  id: number;
  label: string;
};

type ProgressStepsProps = {
  steps: Step[];
  currentStep: number;
};

function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex-1 relative">
            {/* Step connector */}
            {index > 0 && (
              <div 
                className={`absolute top-1/2 transform -translate-y-1/2 left-0 right-0 h-1 -mx-2 z-0 ${
                  currentStep > index ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                style={{ left: '-50%', right: '50%' }}
              ></div>
            )}
            
            <div className="flex flex-col items-center relative z-10">
              {/* Step circle */}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > index 
                    ? 'bg-blue-600 text-white' 
                    : currentStep === index 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > index ? (
                  <Check size={16} />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              
              {/* Step label */}
              <span 
                className={`mt-2 text-xs sm:text-sm ${
                  currentStep >= index ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressSteps;