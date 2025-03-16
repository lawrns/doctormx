import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Info, AlertCircle } from 'lucide-react';
import BreadcrumbNav from './BreadcrumbNav';
import AccessibilityPanel from './AccessibilityPanel';
import analyticsService from '../../services/AnalyticsService';

interface SymptomCheckerLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  showBackButton?: boolean;
  backPath?: string;
  backLabel?: string;
  showBreadcrumbs?: boolean;
  currentStep?: number;
  showDisclaimer?: boolean;
  disclaimerText?: string;
}

const SymptomCheckerLayout: React.FC<SymptomCheckerLayoutProps> = ({
  children,
  title,
  description,
  showBackButton = true,
  backPath = '/sintomas',
  backLabel = 'Volver',
  showBreadcrumbs = true,
  currentStep,
  showDisclaimer = true,
  disclaimerText = 'Esta herramienta no sustituye una evaluación médica profesional. Si tienes dudas o tus síntomas son graves, consulta con un médico inmediatamente.'
}) => {
  const location = useLocation();

  // Track page view
  React.useEffect(() => {
    analyticsService.trackEvent('page_view', {
      page: location.pathname,
      section: 'symptom_checker'
    });
  }, [location.pathname]);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Ir al contenido principal
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          {showBackButton && (
            <Link 
              to={backPath}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
              aria-label={backLabel}
            >
              <ChevronLeft size={20} className="mr-1" />
              {backLabel}
            </Link>
          )}

          {showBreadcrumbs && (
            <BreadcrumbNav currentStep={currentStep} />
          )}
        </div>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-2">
              {description}
            </p>
          )}
        </header>

        {/* Main content */}
        <main id="main-content" className="mb-12">
          {children}
        </main>

        {/* Disclaimer */}
        {showDisclaimer && (
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-amber-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-amber-800">Importante</h3>
                <div className="mt-2 text-amber-700">
                  <p>{disclaimerText}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer with additional info */}
        <footer className="text-center text-sm text-gray-500 mt-12 border-t border-gray-200 pt-8">
          <p className="mb-2">
            Esta herramienta está diseñada para proporcionar información educativa y orientación inicial.
          </p>
          <p>
            Si experimentas una emergencia médica, llama inmediatamente a los servicios de emergencia.
          </p>
        </footer>
      </div>

      {/* Accessibility Panel - fixed position */}
      <AccessibilityPanel position="bottom-right" initialOpen={false} />
    </div>
  );
};

export default SymptomCheckerLayout;