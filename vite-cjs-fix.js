// This file fixes the Vite CJS node API deprecation issue
// As per https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated

// Suppress the Vite CJS API deprecation warning
process.env.VITE_CJS_IGNORE_WARNING = 'true';

// Register import/export support for CJS modules
require('@esbuild-kit/cjs-loader');

console.log('Applied Vite CJS API fix for build process');
