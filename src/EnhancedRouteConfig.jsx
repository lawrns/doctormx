import { createBrowserRouter } from 'react-router-dom';
import EnhancedLayout from './components/EnhancedLayout';
import EnhancedHomePage from './pages/EnhancedHomePage';
import EnhancedDoctorSearchPage from './pages/EnhancedDoctorSearchPage';
import EnhancedDoctorProfilePage from './pages/EnhancedDoctorProfilePage';
import EnhancedBookingPage from './pages/EnhancedBookingPage';
import DoctorSettingsPage from './pages/DoctorSettingsPage';

// Import original pages for routes we haven't enhanced yet
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import AISymptomCheckerPage from './pages/AISymptomCheckerPage';
import AIDoctorPage from './features/ai-doctor/pages/AIDoctorPage';
import AIAnalysisResultsPage from './features/ai-analysis/pages/AIAnalysisResultsPage';
import AIImageAnalysisPage from './features/ai-image-analysis/pages/AIImageAnalysisPage';
import AIPharmaciesPage from './features/ai-doctor/pages/AIPharmaciesPage';
import AIProvidersPage from './features/ai-doctor/pages/AIProvidersPage';
import AlternativeMedicinePage from './pages/AlternativeMedicinePage';
import TelemedicinaPage from './pages/TelemedicinaPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactoPage from './pages/ContactoPage';
import AyudaPage from './pages/AyudaPage';
import MedicosPlanes from './pages/MedicosPlanes';
import MedicosRegistroPage from './pages/MedicosRegistroPage';
import PrivacidadPage from './pages/PrivacidadPage';
import TerminosPage from './pages/TerminosPage';
import QACommunityPage from './pages/QACommunityPage';
import MedicalBoardPage from './pages/MedicalBoardPage';
import EspecialidadesPage from './pages/EspecialidadesPage';

/**
 * Enhanced Route Configuration for Doctor.mx
 * This configuration uses our improved UI/UX components
 * while maintaining compatibility with existing pages.
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <EnhancedLayout />,
    children: [
      {
        index: true,
        element: <EnhancedHomePage />,
      },
      {
        path: 'buscar',
        element: <EnhancedDoctorSearchPage />,
      },
      {
        path: 'doctor/:id',
        element: <EnhancedDoctorProfilePage />,
      },
      {
        path: 'reservar/:id',
        element: <EnhancedBookingPage />,
      },
      {
        path: 'sintomas',
        element: <SymptomCheckerPage />,
      },
      {
        path: 'sintomas/ai',
        element: <AISymptomCheckerPage />,
      },
      {
        path: 'ai-doctor',
        element: <AIDoctorPage />,
      },
      {
        path: 'ai-doctor/analysis/:sessionId',
        element: <AIAnalysisResultsPage />,
      },
      {
        path: 'ai-doctor/image-analysis',
        element: <AIImageAnalysisPage />,
      },
      {
        path: 'ai-doctor/pharmacies/:medications?',
        element: <AIPharmaciesPage />,
      },
      {
        path: 'ai-doctor/providers/:specialty?',
        element: <AIProvidersPage />,
      },
      {
        path: 'alternativa',
        element: <AlternativeMedicinePage />,
      },
      {
        path: 'telemedicina',
        element: <TelemedicinaPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'registro',
        element: <RegisterPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'doctor/:doctorId/settings',
        element: <DoctorSettingsPage />,
      },
      {
        path: 'acerca',
        element: <AboutUsPage />,
      },
      {
        path: 'contacto',
        element: <ContactoPage />,
      },
      {
        path: 'ayuda',
        element: <AyudaPage />,
      },
      {
        path: 'medicos/planes',
        element: <MedicosPlanes />,
      },
      {
        path: 'medicos/registro',
        element: <MedicosRegistroPage />,
      },
      {
        path: 'privacidad',
        element: <PrivacidadPage />,
      },
      {
        path: 'terminos',
        element: <TerminosPage />,
      },
      {
        path: 'comunidad/preguntas',
        element: <QACommunityPage />,
      },
      {
        path: 'doctor-board',
        element: <MedicalBoardPage />,
      },
      {
        path: 'especialidades',
        element: <EspecialidadesPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
