#!/usr/bin/env node

/**
 * This script ensures that the necessary platform-specific Rollup binaries
 * are installed for different environments.
 */

const { execSync } = require('child_process');
const os = require('os');

// Detect the current platform
const platform = os.platform();
const isLinux = platform === 'linux';

// Only run on Linux platforms to ensure the correct binary is installed
if (isLinux) {
  try {
    console.log('Detecting Linux environment and installing appropriate Rollup binaries...');
    
    // Try to detect if we're in a musl environment (Alpine Linux) or gnu environment (most Linux distros)
    const isMusl = (() => {
      try {
        // Check for Alpine or other musl-based distros
        const output = execSync('cat /etc/os-release').toString();
        return output.toLowerCase().includes('alpine');
      } catch (error) {
        // If we can't determine from os-release, assume GNU as it's more common
        return false;
      }
    })();
    
    // Install the appropriate package
    const packageToInstall = isMusl 
      ? '@rollup/rollup-linux-x64-musl' 
      : '@rollup/rollup-linux-x64-gnu';
      
    console.log(`Installing ${packageToInstall}...`);
    execSync(`npm install --no-save ${packageToInstall}`);
    console.log('Rollup binary installation complete!');
  } catch (error) {
    console.error('Error during Rollup binary installation:', error.message);
    // Don't exit with error to allow the install to continue
  }
}
