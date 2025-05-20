import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// This is a direct copy of App.tsx to ensure we have the same functionality
// The original imports may not work directly in jsx files, but we want to ensure
// the build uses App.tsx instead of App.jsx so this is just a safety mechanism

const App = React.lazy(() => import('./App.tsx'));

// This component exists to redirect to the proper App.tsx implementation
function AppWrapper() {
  // We could directly import App.tsx but this approach is more robust for build systems
  return (
    <Suspense fallback={<div>Loading Dr. Simeon...</div>}>
      <App />
    </Suspense>
  );
}

export default AppWrapper;