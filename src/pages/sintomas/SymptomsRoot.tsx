import React from 'react';
import { Outlet } from 'react-router-dom';
import BreadcrumbNav from '../../components/sintomas/BreadcrumbNav';
import AccessibilityPanel from '../../components/sintomas/AccessibilityPanel';
import analyticsService from '../../services/AnalyticsService';

/**
 * This component serves as the root layout for all symptom checker pages
 * It provides the breadcrumb navigation and accessibility controls,
 * as well as tracking analytics for the entire symptom checker flow
 */
const SymptomsRoot: React.FC = () => {
  React.useEffect(() => {
    // Track page entry to symptom checker
    analyticsService.trackEvent('symptom_checker_view', {
      entry_point: document.referrer
    });
    
    // Track when user leaves the symptom checker flow
    return () => {
      analyticsService.trackEvent('symptom_checker_exit');
    };
  }, []);
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav />
        
        {/* Main content area */}
        <Outlet />
        
        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Doctor.mx · Evaluador de síntomas</p>
            <p>Esta herramienta no sustituye una evaluación médica profesional.</p>
          </div>
        </div>
      </div>
      
      {/* Accessibility controls are available throughout the symptom checker */}
      <AccessibilityPanel position="bottom-right" />
    </div>
  );
};

export default SymptomsRoot;