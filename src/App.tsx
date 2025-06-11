import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AILayout from './core/components/AILayout';
import DoctorLayout from './core/components/DoctorLayout';
import SplashScreen from './core/components/SplashScreen';
import ProtectedRoute from './components/ProtectedRoute';

// Import directly instead of lazy loading to test
import AIHomePage from './pages/AIHomePage';
import AIDoctorPage from './features/ai-doctor/pages/AIDoctorPage';
import AnalysisPage from './features/ai-analysis/AnalysisPage';
import ImageAnalysisPage from './features/ai-image-analysis/ImageAnalysisPage';
import AdvancedImageAnalysisPage from './pages/ai-image-analysis/AdvancedImageAnalysisPage';
import LabTestingPage from './pages/LabTestingPageSimple';
import DoctorConnectPage from './pages/DoctorConnectPage';

// Auth pages
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/auth/ResetPasswordPage'));

// Profile pages
const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'));
const MedicalHistoryPage = React.lazy(() => import('./pages/profile/MedicalHistoryPage'));
const FamilyPage = React.lazy(() => import('./pages/profile/FamilyPage'));
const PrescriptionsPage = React.lazy(() => import('./pages/prescriptions/PrescriptionsPage'));

// Appointment pages
const AppointmentsPage = React.lazy(() => import('./pages/appointments/AppointmentsPage'));
const NewAppointmentPage = React.lazy(() => import('./pages/appointments/NewAppointmentPage'));

// Lab Results page
const LabResultsPage = React.lazy(() => import('./pages/lab-results/LabResultsPage'));

// Admin pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const DoctorVerification = React.lazy(() => import('./pages/admin/DoctorVerification'));

// Community pages
const CommunityPage = React.lazy(() => import('./pages/community/CommunityPage'));
const HealthEducationPage = React.lazy(() => import('./pages/community/HealthEducationPage'));

// Constitutional Analysis page
const ConstitutionalAnalysisPage = React.lazy(() => import('./pages/constitutional/ConstitutionalAnalysisPage'));

// Progress Tracking page
const ProgressTrackingPage = React.lazy(() => import('./pages/progress/ProgressTrackingPage'));

// Protocol Timeline page
const ProtocolTimelinePage = React.lazy(() => import('./pages/protocol/ProtocolTimelinePage'));

// Telemedicine pages
const DoctorTelemedicineDashboard = React.lazy(() => import('./pages/doctor/DoctorTelemedicineDashboard'));
const DoctorEarningsPage = React.lazy(() => import('./pages/doctor/DoctorEarningsPage'));
const InstantConsultationPage = React.lazy(() => import('./pages/patient/InstantConsultationPage'));

function App() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <Routes>
        {/* Main AI Layout Routes - no sidebar */}
        <Route path="/*" element={<AILayout />}>
          <Route index element={<AIHomePage />} />
          <Route path="image-analysis" element={<ImageAnalysisPage />} />
          <Route path="advanced-image-analysis" element={<AdvancedImageAnalysisPage />} />
          <Route path="lab-testing" element={<LabTestingPage />} />
          <Route path="constitutional-analysis" element={<ConstitutionalAnalysisPage />} />
          <Route path="connect" element={<DoctorConnectPage />} />
        </Route>

        {/* Doctor Route - with DoctorLayout */}
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<AIDoctorPage />} />
        </Route>

        {/* Auth Routes - no layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

        {/* Profile Routes - with AI layout and auth protection */}
        <Route path="/profile/*" element={
          <ProtectedRoute requireAuth={true}>
            <AILayout />
          </ProtectedRoute>
        }>
          <Route index element={<ProfilePage />} />
          <Route path="medical-history" element={<MedicalHistoryPage />} />
          <Route path="family" element={<FamilyPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="lab-results" element={<LabResultsPage />} />
          <Route path="progress" element={<ProgressTrackingPage />} />
          <Route path="protocols" element={<ProtocolTimelinePage />} />
        </Route>

        {/* Appointment Routes - with AI layout and auth protection */}
        <Route path="/appointments/*" element={
          <ProtectedRoute requireAuth={true}>
            <AILayout />
          </ProtectedRoute>
        }>
          <Route index element={<AppointmentsPage />} />
          <Route path="new" element={<NewAppointmentPage />} />
        </Route>

        {/* Admin Routes - with AI layout and admin protection */}
        <Route path="/admin/*" element={
          <ProtectedRoute requireAuth={true} requireAdmin={true}>
            <AILayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="doctors" element={<DoctorVerification />} />
        </Route>

        {/* Community Routes - with AI layout */}
        <Route path="/community/*" element={<AILayout />}>
          <Route index element={<CommunityPage />} />
          <Route path="education" element={<HealthEducationPage />} />
        </Route>

        {/* Telemedicine Routes - new feature */}
        <Route path="/consultation/*" element={
          <ProtectedRoute requireAuth={true}>
            <AILayout />
          </ProtectedRoute>
        }>
          <Route path="instant" element={<InstantConsultationPage />} />
        </Route>

        {/* Doctor Dashboard Routes - telemedicine */}
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute requireAuth={true} requireDoctor={true}>
            <DoctorTelemedicineDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/doctor/earnings" element={
          <ProtectedRoute requireAuth={true} requireDoctor={true}>
            <DoctorEarningsPage />
          </ProtectedRoute>
        } />

        {/* Doctor/Medical Professional Routes - with sidebar and doctor protection */}
        <Route path="/medical/doctor" element={
          <ProtectedRoute requireAuth={true} requireDoctor={true}>
            <DoctorLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AIDoctorPage />} />
        </Route>

        <Route path="/medical/*" element={
          <ProtectedRoute requireAuth={true} requireDoctor={true} requireVerification={true}>
            <DoctorLayout />
          </ProtectedRoute>
        }>
          <Route path="analysis" element={<AnalysisPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
