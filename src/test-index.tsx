import React from 'react';
import ReactDOM from 'react-dom/client';

const TestApp = () => {
  return (
    <div>
      <h1>Test App</h1>
      <p>If you can see this, the build is working correctly!</p>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
