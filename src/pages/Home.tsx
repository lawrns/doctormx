import React from 'react';
import HomePage from './HomePage';

// This is a wrapper component to maintain backward compatibility
// with existing routes that use Home.tsx instead of HomePage.tsx
const Home: React.FC = () => {
  return <HomePage />;
};

export default Home;