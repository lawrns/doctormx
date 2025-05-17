import React from 'react';

export interface Step {
  id: number;
  label: string;
}

export interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="progress-steps">
      {steps.map((step) => (
        <div
          key={step.id}
          className={step.id === currentStep ? 'step current' : 'step'}
        >
          {step.label}
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;