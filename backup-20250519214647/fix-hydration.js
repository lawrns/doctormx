/**
 * Script to fix hydration issues in the build process
 * Run this before building the application
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting hydration fix script...');

// Ensure we have the necessary dependencies
try {
  console.log('📦 Installing required dependencies...');
  execSync('npm install --no-save @babel/plugin-transform-react-jsx react-refresh', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create the ClientOnly component if it doesn't exist
const clientOnlyPath = path.join(__dirname, 'src', 'components', 'ClientOnly.tsx');
if (!fs.existsSync(clientOnlyPath)) {
  console.log('📝 Creating ClientOnly component...');
  const clientOnlyContent = `import React, { useState, useEffect, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that only renders its children on the client-side
 * This prevents hydration errors for components that use browser APIs
 */
function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <>{children}</> : <>{fallback}</>;
}

export default ClientOnly;`;

  fs.writeFileSync(clientOnlyPath, clientOnlyContent);
  console.log('✅ Created ClientOnly component');
}

// Create the client utilities if they don't exist
const clientUtilsPath = path.join(__dirname, 'src', 'utils', 'clientUtils.ts');
if (!fs.existsSync(clientUtilsPath)) {
  console.log('📝 Creating client utilities...');
  
  // Ensure the utils directory exists
  const utilsDir = path.join(__dirname, 'src', 'utils');
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }
  
  const clientUtilsContent = `/**
 * Utility functions for safely handling client-side operations
 * to prevent hydration mismatches
 */

import { useEffect, useState } from 'react';

/**
 * Safely access window object only on the client side
 */
export const isClient = typeof window !== 'undefined';

/**
 * Hook to safely use client-side features after component mount
 * @returns {boolean} Whether the component has mounted
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  return hasMounted;
}

/**
 * Safely access localStorage with fallbacks
 */
export function safeLocalStorage() {
  if (!isClient) {
    // Return dummy implementation for SSR
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined
    };
  }
  
  try {
    // Test localStorage access
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return localStorage;
  } catch (e) {
    // Fallback if localStorage is not available
    console.warn('localStorage not available, using in-memory storage');
    const storage: Record<string, string> = {};
    return {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => { storage[key] = value; },
      removeItem: (key: string) => { delete storage[key]; }
    };
  }
}`;

  fs.writeFileSync(clientUtilsPath, clientUtilsContent);
  console.log('✅ Created client utilities');
}

console.log('✅ Hydration fix script completed successfully!');
