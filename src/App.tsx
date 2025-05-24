import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AILayout from './core/components/AILayout';
import DoctorLayout from './core/components/DoctorLayout';
import SplashScreen from './core/components/SplashScreen';

const AIHomePage = React.lazy(() => import('./pages/AIHomePage'));
const AIDoctorPage = React.lazy(() => import('./features/ai-doctor/pages/AIDoctorPage'));
const AnalysisPage = React.lazy(() => import('./features/ai-analysis/AnalysisPage'));
const ImageAnalysisPage = React.lazy(() => import('./features/ai-image-analysis/ImageAnalysisPage'));
const LabTestingPage = React.lazy(() => import('./features/lab-testing/LabTestingPage'));
const DoctorConnectPage = React.lazy(() => import('./pages/DoctorConnectPage'));

function App() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <Routes>
        {/* Main AI Layout Routes - no sidebar */}
        <Route path="/*" element={<AILayout />}>
          <Route index element={<AIHomePage />} />
          <Route path="image-analysis" element={<ImageAnalysisPage />} />
          <Route path="lab-testing" element={<LabTestingPage />} />
          <Route path="connect" element={<DoctorConnectPage />} />
        </Route>
        
        {/* Doctor/Medical Professional Routes - with sidebar */}
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<AIDoctorPage />} />
        </Route>
        
        <Route path="/medical/*" element={<DoctorLayout />}>
          <Route path="analysis" element={<AnalysisPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
