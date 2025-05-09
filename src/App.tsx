import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AILayout from './core/components/AILayout';
import SplashScreen from './core/components/SplashScreen';

const AIHomePage = React.lazy(() => import('./pages/AIHomePage'));
const AIDoctorPage = React.lazy(() => import('./features/ai-doctor/pages/AIDoctorPage'));
const AIAnalysisResultsPage = React.lazy(() => import('./features/ai-analysis/pages/AIAnalysisResultsPage'));
const AIImageAnalysisPage = React.lazy(() => import('./features/ai-image-analysis/pages/AIImageAnalysisPage'));

function App() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <Routes>
        <Route path="/" element={<AILayout />}>
          <Route index element={<AIHomePage />} />
          <Route path="doctor" element={<AIDoctorPage />} />
          <Route path="analysis/:sessionId" element={<AIAnalysisResultsPage />} />
          <Route path="image-analysis" element={<AIImageAnalysisPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
