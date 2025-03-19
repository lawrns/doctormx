import React from 'react';
import { Outlet } from 'react-router-dom';
import EnhancedNavbar from '../navigation/EnhancedNavbar';
import Footer from '../navigation/Footer';
import SkipToContent from '../accessibility/SkipToContent';

const Layout = () => {
  return (
    <>
      <SkipToContent />
      <EnhancedNavbar />
      <main id="main-content" className="min-h-screen pt-16">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;