import React from 'react';
import { useLocation } from 'react-router-dom';
import BreadcrumbNav from './BreadcrumbNav';
import AccessibilityPanel from './AccessibilityPanel';

interface SymptomsLayoutProps {
  children: React.ReactNode;
  currentStep?: number;
  showAccessibilityPanel?: boolean;
  showBreadcrumbs?: boolean;
}

const SymptomsLayout: React.FC<SymptomsLayoutProps> = ({
  children,
  currentStep,
  showAccessibilityPanel = true,
  showBreadcrumbs = true
}) => {
  const location = useLocation();
  
  // Check if the user is in the symptom checker flow
  const isInSymptomsFlow = location.pathname.startsWith('/sintomas');
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {showBreadcrumbs && isInSymptomsFlow && (
          <BreadcrumbNav currentStep={currentStep} />
        )}
        
        <div className="mb-6">
          {children}
        </div>
        
        <div className="text-sm text-center text-gray-500 mt-8">
          <p>
            Esta herramienta no sustituye una evaluación médica profesional.
            Si experimenta síntomas graves, busque atención médica inmediata.
          </p>
        </div>
      </div>
      
      {showAccessibilityPanel && (
        <AccessibilityPanel position="bottom-right" />
      )}
    </div>
  );
};

export default SymptomsLayout;