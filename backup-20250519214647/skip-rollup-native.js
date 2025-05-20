// This script creates a simplified rollup native module implementation that skips native modules

const fs = require('fs');
const path = require('path');

// Path to the native.js file
const NATIVE_PATH = path.join(process.cwd(), 'node_modules', 'rollup', 'dist', 'native.js');

// Simplified content that avoids native module dependencies
const PATCH_CONTENT = `
// This is a patched version that skips native module loading
export function getDefaultExportsFromCjs() {
  return {};
}

export function getPackageVersion() {
  return '3.0.0';
}

export function getDynamicImportNative() {
  return null;
}

export function getFileNative() {
  return null;
}

export function getNativeDefault() {
  return null;
}

export { getDefaultExportsFromCjs as default };
`;

// Check if the file exists
if (fs.existsSync(NATIVE_PATH)) {
  // Create a backup if it doesn't exist
  const backupPath = `${NATIVE_PATH}.backup`;
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(NATIVE_PATH, backupPath);
    console.log(`Created backup at ${backupPath}`);
  }

  // Write the patched content
  fs.writeFileSync(NATIVE_PATH, PATCH_CONTENT);
  console.log(`Successfully patched ${NATIVE_PATH}`);
} else {
  console.error(`Could not find ${NATIVE_PATH}`);
  process.exit(1);
}
