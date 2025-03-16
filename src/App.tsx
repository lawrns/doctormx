import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DoctorSearchPage from './pages/DoctorSearchPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PatientCommunityDashboard from './pages/PatientCommunityDashboard';
import NotFoundPage from './pages/NotFoundPage';
import EspecialidadesPage from './pages/EspecialidadesPage';
import TelemedicinaPage from './pages/TelemedicinaPage';
import MedicosRegistroPage from './pages/MedicosRegistroPage';
import MedicosPlanes from './pages/MedicosPlanes';
import ContactoPage from './pages/ContactoPage';
import PrivacidadPage from './pages/PrivacidadPage';
import TerminosPage from './pages/TerminosPage';
import AyudaPage from './pages/AyudaPage';
import AlternativeMedicinePage from './pages/AlternativeMedicinePage';
import QACommunityPage from './pages/QACommunityPage';
import MedicalBoardPage from './pages/MedicalBoardPage';
import AboutUsPage from './pages/AboutUsPage';
import ConnectLandingPage from './pages/connect/ConnectLandingPage';
import MedicosRegistroConnectPage from './pages/connect/MedicosRegistroConnectPage';
import UpgradeStatusPage from './pages/UpgradeStatusPage';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import DoctorsListPage from './pages/admin/doctors/DoctorsListPage';
import DoctorVerificationPage from './pages/admin/doctors/DoctorVerificationPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

// Import Symptom Checker pages
import SymptomsRoot from './pages/sintomas/SymptomsRoot';
import SymptomCheckerLanding from './pages/sintomas/index';
import EvaluacionPage from './pages/sintomas/EvaluacionPage';
import ResultadosPage from './pages/sintomas/ResultadosPage';

// Import analytics service
import analyticsService from './services/AnalyticsService';

function App() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Track page view in analytics
    analyticsService.trackEvent('page_view', {
      path: location.pathname,
      search: location.search
    });
  }, [location.pathname, location.search]);

  // Set user ID in analytics if authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // In a real implementation, we would set the user ID in analytics
      // analyticsService.setUserId(user.id);
    }
  }, [isAuthenticated, user]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="buscar" element={<DoctorSearchPage />} />
        <Route path="doctor/:id" element={<DoctorProfilePage />} />
        <Route path="reservar/:doctorId" element={<BookingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />
        <Route path="dashboard/*" element={
          <ProtectedRoute isAllowed={isAuthenticated}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="comunidad" element={
          <ProtectedRoute isAllowed={isAuthenticated}>
            <PatientCommunityDashboard />
          </ProtectedRoute>
        } />
        <Route path="especialidades" element={<EspecialidadesPage />} />
        <Route path="telemedicina" element={<TelemedicinaPage />} />
        <Route path="medicos/registro" element={<MedicosRegistroPage />} />
        <Route path="medicos/planes" element={<MedicosPlanes />} />
        <Route path="contacto" element={<ContactoPage />} />
        <Route path="privacidad" element={<PrivacidadPage />} />
        <Route path="terminos" element={<TerminosPage />} />
        <Route path="ayuda" element={<AyudaPage />} />
        
        {/* Symptom Checker Routes with Root Layout */}
        <Route path="sintomas" element={<SymptomsRoot />}>
          <Route index element={<SymptomCheckerLanding />} />
          <Route path="evaluacion" element={<EvaluacionPage />} />
          <Route path="resultados" element={<ResultadosPage />} />
        </Route>
        
        <Route path="alternativa" element={<AlternativeMedicinePage />} />
        <Route path="comunidad/preguntas" element={<QACommunityPage />} />
        <Route path="doctor-board" element={<MedicalBoardPage />} />
        <Route path="doctor-dashboard/*" element={
          <ProtectedRoute isAllowed={isAuthenticated}>
            <DoctorDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="acerca" element={<AboutUsPage />} />
        <Route path="connect" element={<ConnectLandingPage />} />
        <Route path="connect/:referralId" element={<ConnectLandingPage />} />
        <Route path="connect/registro" element={<MedicosRegistroConnectPage />} />
        <Route path="upgrade-status" element={<UpgradeStatusPage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin">
        <Route path="login" element={<AdminLoginPage />} />
        <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="doctors" element={<DoctorsListPage />} />
          <Route path="doctors/:id" element={<DoctorVerificationPage />} />
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;