import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AILayout from './core/components/AILayout';
import SplashScreen from './core/components/SplashScreen';

const AIHomePage = React.lazy(() => import('./pages/AIHomePage'));
// This is importing the canonical version of AIDoctorPage
const AIDoctorPage = React.lazy(() => import('./features/ai-doctor/pages/AIDoctorPage'));
const AIAnalysisResultsPage = React.lazy(() => import('./features/ai-analysis/pages/AIAnalysisResultsPage'));
const AIImageAnalysisPage = React.lazy(() => import('./features/ai-image-analysis/pages/AIImageAnalysisPage'));
const APIKeyConfigPage = React.lazy(() => import('./pages/settings/APIKeyConfigPage'));
const AICharacterSettingsPage = React.lazy(() => import('./pages/settings/AICharacterSettingsPage'));
const ConnectLandingPage = React.lazy(() => import('./pages/ConnectLandingPage'));
const LabTestingLandingPage = React.lazy(() => import('./pages/LabTestingLandingPage'));
const LabTestingPage = React.lazy(() => import('./pages/LabTestingPage'));

// Import doctor dashboard components without lazy loading to avoid auth context issues
import DoctorRoutes from './routes/DoctorRoutes';

function App() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <Routes>
        <Route path="/" element={<AILayout />}>
          <Route index element={<AIHomePage />} />
          <Route path="doctor" element={<AIDoctorPage />} />
          <Route path="ai-doctor" element={<AIDoctorPage />} />
          <Route path="doctor-dashboard/*" element={<Navigate to="/connect" replace />} />
          <Route path="connect" element={<ConnectLandingPage />} />
          <Route path="connect/*" element={<DoctorRoutes />} />
          <Route path="analysis/:sessionId" element={<AIAnalysisResultsPage />} />
          <Route path="analisis-imagenes" element={<AIImageAnalysisPage />} />
          <Route path="image-analysis" element={<AIImageAnalysisPage />} />
          <Route path="settings/api" element={<APIKeyConfigPage />} />
          <Route path="settings/ai-character" element={<AICharacterSettingsPage />} />
          <Route path="lab-testing" element={<LabTestingLandingPage />} />
          <Route path="lab-testing/app" element={<LabTestingPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
