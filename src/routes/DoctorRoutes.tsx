import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import DoctorDashboardPage from '../pages/doctor/DoctorDashboardHome';
import AppointmentsPage from '../pages/doctor/AppointmentsPage';
import BrandingSettingsPage from '../pages/doctor/BrandingSettingsPage';
import AnalyticsDashboardPage from '../pages/doctor/AnalyticsDashboardPage';
import CommunityPage from '../pages/doctor/CommunityPage';
import EnhancedTelemedicineConsultationPage from '../pages/doctor/EnhancedTelemedicineConsultationPage';
import EnhancedDoctorProfilePage from '../pages/doctor/EnhancedDoctorProfilePage';
import PatientManagementPage from '../pages/doctor/PatientManagementPage';
import PatientDetailPage from '../pages/doctor/PatientDetailPage';
import DigitalPrescriptionPage from '../pages/doctor/DigitalPrescriptionPage';
import DoctoraliaIntegrationPage from '../pages/doctor/DoctoraliaIntegrationPage';
import WaitingRoomPage from '../pages/doctor/WaitingRoomPage';

const DoctorRoutes: React.FC = () => {
  return (
    <AuthProvider>
    <Routes>
      {/* Root dashboard path redirects to nested dashboard */}
      <Route index element={<DoctorDashboardPage />} />
      
      {/* Dashboard */}
      <Route path="dashboard" element={<DoctorDashboardPage />} />
      
      {/* Appointments */}
      <Route path="appointments" element={<AppointmentsPage />} />
      <Route path="appointments/:appointmentId" element={<AppointmentsPage />} />
      
      {/* Patient Management */}
      <Route path="patients" element={<PatientManagementPage />} />
      <Route path="patients/:patientId" element={<PatientDetailPage />} />
      
      {/* Prescriptions */}
      <Route path="prescriptions/new" element={<DigitalPrescriptionPage />} />
      <Route path="prescriptions/:prescriptionId" element={<DigitalPrescriptionPage />} />
      
      {/* Community */}
      <Route path="community" element={<CommunityPage />} />
      
      {/* Analytics */}
      <Route path="analytics" element={<AnalyticsDashboardPage />} />
      
      {/* Telemedicine */}
      <Route path="telemedicine/consultation" element={<EnhancedTelemedicineConsultationPage />} />
      <Route path="telemedicine/consultation/:appointmentId" element={<EnhancedTelemedicineConsultationPage />} />
      <Route path="telemedicine/waiting-room" element={<WaitingRoomPage />} />
      
      {/* Settings */}
      <Route path="settings/profile" element={<EnhancedDoctorProfilePage />} />
      <Route path="settings/branding" element={<BrandingSettingsPage />} />
      <Route path="settings/doctoralia" element={<DoctoraliaIntegrationPage />} />
      
      {/* Messages (Fallback to dashboard) */}
      <Route path="messages" element={<DoctorDashboardPage />} />
      <Route path="messages/:messageId" element={<DoctorDashboardPage />} />
      
      {/* Reviews (Fallback to dashboard) */}
      <Route path="reviews" element={<DoctorDashboardPage />} />
      
      {/* Fallback for any other routes */}
      <Route path="*" element={<Navigate to="/doctor-dashboard" replace />} />
    </Routes>
    </AuthProvider>
  );
};

export default DoctorRoutes;