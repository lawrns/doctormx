import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home, Thermometer, Search, FileText } from 'lucide-react';

interface BreadcrumbStep {
  path: string;
  label: string;
  icon: React.ReactNode;
  state?: Record<string, any>;
}

interface BreadcrumbNavProps {
  currentStep?: number;
  customSteps?: BreadcrumbStep[];
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ currentStep: propCurrentStep, customSteps }) => {
  const location = useLocation();
  
  // Default steps for the symptom checker flow
  const defaultSteps: BreadcrumbStep[] = [
    { 
      path: '/sintomas', 
      label: 'Inicio', 
      icon: <Home size={16} className="mr-1" /> 
    },
    { 
      path: '/sintomas/evaluacion', 
      label: 'Evaluación', 
      icon: <Thermometer size={16} className="mr-1" /> 
    },
    { 
      path: '/sintomas/resultados', 
      label: 'Resultados', 
      icon: <FileText size={16} className="mr-1" /> 
    }
  ];
  
  const steps = customSteps || defaultSteps;
  
  // Determine current step based on route if not explicitly provided
  const getCurrentStep = () => {
    if (propCurrentStep !== undefined) return propCurrentStep;
    
    const currentPath = location.pathname;
    const index = steps.findIndex(step => step.path === currentPath);
    return index !== -1 ? index : 0;
  };
  
  const currentStepIndex = getCurrentStep();

  return (
    <nav className="mb-6" aria-label="Navegación">
      <ol className="flex flex-wrap items-center space-x-2 text-sm text-gray-500">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          
          return (
            <li key={step.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight size={14} className="mx-2 text-gray-400 flex-shrink-0" aria-hidden="true" />
              )}
              
              {isCompleted ? (
                <Link 
                  to={step.path}
                  state={step.state}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                  aria-current={isActive ? 'page' : undefined}
                >
                  {step.icon}
                  {step.label}
                </Link>
              ) : isActive ? (
                <span 
                  className="flex items-center font-medium text-blue-600"
                  aria-current="page"
                >
                  {step.icon}
                  {step.label}
                </span>
              ) : (
                <span className="flex items-center text-gray-400">
                  {step.icon}
                  {step.label}
                </span>
              )}
              
              {isCompleted && (
                <span className="ml-1.5 flex-shrink-0 w-4 h-4 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;