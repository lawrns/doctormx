import React from 'react';
import { Outlet } from 'react-router-dom';
import AINavbar from './AINavbar';
import AIFooter from './AIFooter';

function AILayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AINavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <AIFooter />
    </div>
  );
}

export default AILayout;
