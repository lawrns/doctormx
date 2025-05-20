# Symptom Checker Integration Guide

This guide explains how to integrate all the created components for the enhanced symptom checker.

## Component Overview

Here are the components we've built:

1. **Enhanced Body Selector**: An interactive 3D body model with improved UX.
2. **AI Conversation Form**: Enhanced natural language symptom analysis.
3. **Questionnaire Flow**: Step-by-step symptom assessment.
4. **Results Card**: Visual display of analysis results.
5. **Specialist Recommendations**: Doctor recommendation display.
6. **Medical Info Panel**: Educational content about conditions.
7. **Symptom Tracker**: Tool for tracking symptoms over time.
8. **Health Profile**: Personal health information storage.
9. **Breadcrumb Nav**: Navigation for the symptom checker flow.
10. **Results Export**: Export and sharing functionality.
11. **Health Education**: Medical education resources.
12. **Accessibility Panel**: Accessibility features control.

## Integration Examples

### 1. Integrating Accessibility Panel

The Accessibility Panel should be placed in the main App.tsx file to be globally available:

```jsx
// App.tsx
import AccessibilityPanel from './components/sintomas/AccessibilityPanel';

function App() {
  return (
    <>
      <AccessibilityPanel position="bottom-right" />
      <Routes>
        {/* Routes here */}
      </Routes>
    </>
  );
}
```

### 2. Enhancing Evaluacion Page

Update the EvaluacionPage.tsx to integrate BreadcrumbNav and Health Profile:

```jsx
// In EvaluacionPage.tsx
import BreadcrumbNav from '../../components/sintomas/BreadcrumbNav';
import HealthProfile from '../../components/sintomas/HealthProfile';

// Inside your component render function:
return (
  <div className="bg-gray-50 min-h-screen py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Add BreadcrumbNav */}
      <BreadcrumbNav currentStep={1} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Evaluación de Síntomas</h1>
        <p className="text-gray-600 mt-2">
          {/* Description text */}
        </p>
      </div>
      
      {/* Add HealthProfile in a collapsible section */}
      <div className="mb-6">
        <details className="bg-white rounded-lg shadow-sm overflow-hidden">
          <summary className="p-4 cursor-pointer font-medium text-blue-800 flex items-center">
            <User size={18} className="mr-2" />
            Mi perfil de salud (opcional)
          </summary>
          <div className="border-t border-gray-100">
            <HealthProfile compact={true} />
          </div>
        </details>
      </div>
      
      {/* Rest of your existing code */}
    </div>
  </div>
);
```

### 3. Enhancing Results Page

Update ResultadosPage.tsx to integrate multiple components:

```jsx
// In ResultadosPage.tsx
import BreadcrumbNav from '../../components/sintomas/BreadcrumbNav';
import HealthEducation from '../../components/sintomas/HealthEducation';
import SymptomTracker from '../../components/sintomas/SymptomTracker';
import ResultsExport from '../../components/sintomas/ResultsExport';
import { useState, useRef } from 'react';

// Inside your component:
const [showExportModal, setShowExportModal] = useState(false);
const resultsRef = useRef(null);

// In your render function:
return (
  <div className="bg-gray-50 min-h-screen py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Add BreadcrumbNav */}
      <BreadcrumbNav currentStep={2} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resultados de la Evaluación</h1>
        <p className="text-gray-600 mt-2">
          {/* Description text */}
        </p>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          <Download size={16} className="mr-2" />
          Exportar
        </button>
        {/* Other buttons */}
      </div>
      
      {/* Results content - wrap in a ref for export */}
      <div ref={resultsRef}>
        {/* Your existing results content */}
      </div>
      
      {/* Add Health Education */}
      <div className="mb-8">
        <HealthEducation 
          symptomId={symptomData?.symptomId} 
          symptomName={symptomData?.symptom?.name}
        />
      </div>
      
      {/* Add Symptom Tracker */}
      <div className="mb-8">
        <SymptomTracker 
          initialSymptom={{
            id: symptomData?.symptomId || 'general',
            name: symptomData?.symptom?.name || 'Síntoma general'
          }}
        />
      </div>
      
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full">
            <ResultsExport 
              data={{
                title: `Evaluación de: ${symptomData?.symptom?.name}`,
                date: new Date(),
                sections: [
                  {
                    title: 'Información de síntomas',
                    items: [
                      {
                        label: 'Síntoma principal',
                        value: symptomData?.symptom?.name
                      },
                      // Add more items based on your data structure
                    ]
                  },
                  // Add more sections
                ]
              }}
              elementToExport={resultsRef}
              onClose={() => setShowExportModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  </div>
);
```

### 4. Integration with Analytics

Add analytics tracking to your components:

```jsx
// Import analytics service
import analyticsService from '../../services/AnalyticsService';

// Inside your component functions:

// Track when user starts symptom checker
useEffect(() => {
  analyticsService.trackSymptomCheckerStart(method);
}, [method]);

// Track when user selects a symptom
const handleSymptomSelect = (symptom) => {
  analyticsService.trackSymptomSelection(symptom.id, symptom.name, bodyRegion);
  // Your existing code
};

// Track when analysis is complete
const handleQuestionnaireComplete = (data) => {
  analyticsService.trackAnalysisComplete(data);
  // Your existing code
};
```

## Combining the Symptom Checker Methods

The symptom checker offers two methods: body selection and AI conversation. Here's how to integrate them to work seamlessly:

```jsx
// In EvaluacionPage.tsx

// Method selection tabs
<div className="mb-6">
  <div className="border-b border-gray-200">
    <nav className="-mb-px flex">
      <button
        onClick={() => handleMethodChange('body')}
        className={`py-2 px-4 border-b-2 font-medium text-sm ${
          method === 'body'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        Selección por Cuerpo
      </button>
      <button
        onClick={() => handleMethodChange('ai')}
        className={`ml-8 py-2 px-4 border-b-2 font-medium text-sm ${
          method === 'ai'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        Asistente Inteligente
      </button>
    </nav>
  </div>
</div>

{/* Body Selection Flow */}
{method === 'body' && !selectedBodyRegion && (
  <motion.div
    key="body-selector"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {isAdvanced ? (
      <Enhanced3DBodySelector onSelectRegion={handleBodyRegionSelect} />
    ) : (
      <BodySelector onSelectRegion={handleBodyRegionSelect} />
    )}
  </motion.div>
)}

{method === 'body' && selectedBodyRegion && (
  <motion.div
    key="questionnaire"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
  >
    <QuestionnaireFlow 
      bodyRegion={selectedBodyRegion}
      onComplete={handleQuestionnaireComplete}
    />
  </motion.div>
)}

{/* AI Conversation Flow */}
{method === 'ai' && (
  <motion.div
    key="ai-conversation"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <AIConversationForm onComplete={handleQuestionnaireComplete} />
  </motion.div>
)}
```

## Mobile Optimization

To optimize for mobile:

1. Use responsive design patterns
2. Simplify complex UI on smaller screens
3. Ensure touch targets are at least 44px in size
4. Use collapsible sections to conserve space

Example mobile optimization for Enhanced3DBodySelector:

```jsx
// Inside Enhanced3DBodySelector.tsx

useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth < 640) {
      // Switch to simple view on small screens
      setUseSimpleView(true);
    } else {
      // Use device capabilities to determine view on larger screens
      setUseSimpleView(!is3DSupported);
    }
  };
  
  // Set initial state
  handleResize();
  
  // Update on resize
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [is3DSupported]);
```

## Testing the Integration

After integrating all components, test the complete flow:

1. Start from the landing page
2. Test both body selection and AI conversation paths
3. Verify the questionnaire flow works correctly
4. Check result display and all interactive elements
5. Test exporting and sharing functionality
6. Verify symptom tracker and health profile data persistence
7. Test accessibility features

## Final Touches

Add error boundaries around each major component to prevent global failures:

```jsx
// ErrorBoundary.tsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h3 className="text-red-800 font-medium">Algo salió mal</h3>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-red-600 underline"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage:
<ErrorBoundary>
  <AIConversationForm onComplete={handleQuestionnaireComplete} />
</ErrorBoundary>
```
