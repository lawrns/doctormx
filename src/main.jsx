import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DoctorAI from './pages/DoctorAI.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import ConnectLanding from './pages/ConnectLanding.jsx';
import DoctorSignup from './pages/DoctorSignup.jsx';
import DoctorVerification from './pages/DoctorVerification.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import DoctorDirectory from './pages/DoctorDirectory.jsx';
import DoctorProfile from './pages/DoctorProfile.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import PaymentCheckout from './pages/PaymentCheckout.jsx';
import PharmacyPortal from './pages/PharmacyPortal.jsx';
import VisionConsultation from './pages/VisionConsultation.jsx';
import HealthCommunity from './components/HealthCommunity.jsx';
import HealthMarketplace from './components/HealthMarketplace.jsx';
import GamificationDashboard from './components/GamificationDashboard.jsx';
import AffiliateDashboard from './components/AffiliateDashboard.jsx';
import SubscriptionPlans from './components/SubscriptionPlans.jsx';
import EnhancedDoctorPanel from './components/EnhancedDoctorPanel.jsx';
import AIReferralSystem from './components/AIReferralSystem.jsx';
import QABoard from './components/QABoard.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx';
import ToastConfig from './components/Toast/ToastConfig.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/doctor' element={
            <ProtectedRoute>
              <DoctorAI />
            </ProtectedRoute>
          } />

          {/* Doctor onboarding and dashboard */}
          <Route path='/connect' element={<ConnectLanding />} />
          <Route path='/connect/signup' element={<DoctorSignup />} />
          <Route path='/connect/verify' element={
            <ProtectedRoute>
              <DoctorVerification />
            </ProtectedRoute>
          } />
          <Route path='/connect/dashboard' element={
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          } />

          {/* Payment checkout */}
          <Route path='/pay/checkout' element={
            <ProtectedRoute>
              <PaymentCheckout />
            </ProtectedRoute>
          } />

          {/* Pharmacy portal */}
          <Route path='/pharmacy/portal' element={
            <ProtectedRoute>
              <PharmacyPortal />
            </ProtectedRoute>
          } />

          {/* Doctor directory */}
          <Route path='/doctors' element={<DoctorDirectory />} />
          <Route path='/doctors/:id' element={<DoctorProfile />} />

          {/* Patient dashboard */}
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <PatientDashboard />
            </ProtectedRoute>
          } />

          {/* Vision consultation */}
          <Route path='/vision' element={
            <ProtectedRoute>
              <VisionConsultation />
            </ProtectedRoute>
          } />

          {/* Community */}
          <Route path='/community' element={
            <ProtectedRoute>
              <HealthCommunity />
            </ProtectedRoute>
          } />

          {/* Marketplace */}
          <Route path='/marketplace' element={
            <ProtectedRoute>
              <HealthMarketplace />
            </ProtectedRoute>
          } />

          {/* Gamification */}
          <Route path='/gamification' element={
            <ProtectedRoute>
              <GamificationDashboard />
            </ProtectedRoute>
          } />

          {/* Affiliate */}
          <Route path='/affiliate' element={
            <ProtectedRoute>
              <AffiliateDashboard />
            </ProtectedRoute>
          } />

          {/* Subscription Plans */}
          <Route path='/subscriptions' element={
            <ProtectedRoute>
              <SubscriptionPlans />
            </ProtectedRoute>
          } />

          {/* Enhanced Doctor Panel */}
          <Route path='/doctor-panel' element={
            <ProtectedRoute>
              <EnhancedDoctorPanel />
            </ProtectedRoute>
          } />

          {/* AI Referral System */}
          <Route path='/ai-referrals' element={
            <ProtectedRoute>
              <AIReferralSystem />
            </ProtectedRoute>
          } />

          {/* Q&A Board */}
          <Route path='/qa' element={<QABoard />} />
        </Routes>
        <ToastConfig />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
