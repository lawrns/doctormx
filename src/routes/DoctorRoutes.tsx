import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MedicosRegistroConnectPage from '../pages/connect/MedicosRegistroConnectPage';

const DoctorRoutes: React.FC = () => (
  <Routes>
    <Route path="register" element={<MedicosRegistroConnectPage />} />
  </Routes>
);

export default DoctorRoutes;