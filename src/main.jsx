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
        </Routes>
        <ToastConfig />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
