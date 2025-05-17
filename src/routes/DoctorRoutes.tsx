import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MedicosRegistroConnectPage from '../pages/connect/MedicosRegistroConnectPage';
import MarketingToolsPage from '../pages/doctor/MarketingToolsPage';
import ReferralSettingsPage from '../pages/doctor/marketing/referrals/ReferralSettingsPage';

const DoctorRoutes: React.FC = () => (
  <Routes>
    <Route path="register" element={<MedicosRegistroConnectPage />} />
    <Route path="marketing" element={<MarketingToolsPage />} />
    <Route path="marketing/referrals/settings" element={<ReferralSettingsPage />} />
  </Routes>
);

export default DoctorRoutes;