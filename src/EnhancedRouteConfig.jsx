import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorSearch from './pages/DoctorSearch';
import DoctorProfile from './pages/DoctorProfile';
import Appointment from './pages/Appointment';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const RouterConfig = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="search" element={<DoctorSearch />} />
        <Route path="doctor/:id" element={<DoctorProfile />} />
        <Route path="appointment" element={
          <ProtectedRoute>
            <Appointment />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default RouterConfig;