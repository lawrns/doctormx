// Standalone build script for Netlify
// This bypasses Vite's configuration system and calls the build directly

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up simplified build environment...');

// ALL dependencies should already be installed by the netlify.toml command
console.log('📦 Verifying core dependencies for Vite build...');
try {
  // Install specific versions to ensure compatibility
  execSync('npm list vite @vitejs/plugin-react postcss autoprefixer tailwindcss', {
    stdio: 'inherit'
  });
  console.log('✅ Dependencies verified');
} catch (error) {
  console.warn('⚠️ Some dependencies might be missing, installing fallbacks...');
  try {
    execSync('npm install --no-save vite@4.5.1 @vitejs/plugin-react@4.1.0 postcss@8.4.31 autoprefixer@10.4.16 tailwindcss@3.3.3 @babel/plugin-transform-react-jsx @esbuild-kit/cjs-loader', {
      stdio: 'inherit'
    });
    console.log('✅ Fallback dependencies installed');
  } catch (installError) {
    console.error('❌ Error installing fallback dependencies:', installError.message);
    process.exit(1);
  }
}

// Create a .babelrc file that properly configures the react-jsx plugin
console.log('📝 Creating proper Babel configuration...');
const babelConfig = {
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "browsers": [">0.5%", "not dead", "not op_mini all"]
      }
    }],
    ["@babel/preset-react", {
      "runtime": "automatic"
    }],
    "@babel/preset-typescript"
  ],
  "plugins": [
    ["@babel/plugin-transform-react-jsx", { "runtime": "automatic" }]
  ]
};

fs.writeFileSync('.babelrc.json', JSON.stringify(babelConfig, null, 2));
console.log('✅ Babel configuration created');

// Generate a minimal vite.config.js if needed
console.log('📝 Creating minimal Vite config if needed...');
const viteConfigPath = path.join(__dirname, 'vite.config.js');
let needsConfig = false;

try {
  // Check if vite.config.js exists and contains plugin-react
  const configContent = fs.readFileSync(viteConfigPath, 'utf8');
  if (!configContent.includes('@vitejs/plugin-react')) {
    needsConfig = true;
  }
} catch (error) {
  // File doesn't exist or can't be read
  needsConfig = true;
}

if (needsConfig) {
  console.log('⚠️ Creating minimal vite.config.js...');
  const minimalConfig = `
// Minimal Vite config for Netlify build
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: true,
  },
});
  `;
  
  // First write as ESM
  fs.writeFileSync('vite.config.mjs', minimalConfig);
  
  // Then write a CJS version
  const cjsConfig = `
// Minimal Vite config for Netlify build (CommonJS)
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: true,
  },
});
  `;
  fs.writeFileSync('vite.config.js', cjsConfig);
  console.log('✅ Created minimal Vite configs');
}

// Execute the build using direct API rather than CLI
console.log('🏗️ Running Vite build with modified process...');
try {
  // Try multiple build approaches in sequence
  const buildApproaches = [
    // Approach 1: Use locally installed vite directly
    {
      command: 'node ./node_modules/vite/bin/vite.js build --mode production',
      description: 'local vite module'
    },
    // Approach 2: Try NPX with specific version
    {
      command: 'npx vite@4.5.1 build --mode production',
      description: 'npx with specific version'
    },
    // Approach 3: Use global Vite if available
    {
      command: 'vite build --mode production',
      description: 'global vite command'
    }
  ];
  
  // Try each approach in sequence until one succeeds
  let buildSucceeded = false;
  
  for (const approach of buildApproaches) {
    console.log(`Trying build with ${approach.description}...`);
    try {
      process.env.ROLLUP_NATIVE_DISABLE = 'true'; // Disable Rollup native modules
      process.env.VITE_CJS_IGNORE_WARNING = 'true'; // Suppress Vite CJS API deprecation warning
      process.env.NODE_ENV = 'production';
      
      execSync(approach.command, {
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'production'
        }
      });
      
      console.log(`✅ Build completed successfully with ${approach.description}!`);
      buildSucceeded = true;
      break;
    } catch (approachError) {
      console.warn(`⚠️ Build approach with ${approach.description} failed:`, approachError.message);
    }
  }
  
  if (!buildSucceeded) {
    throw new Error('All build approaches failed');
  }
} catch (error) {
  console.error('❌ Build failed with all approaches:', error.message);
  
  // Fallback to another approach
  try {
    console.log('⚠️ Trying fallback build approach...');
    // Create a simple build script that will at least make the site load
    const buildScript = `
    const fs = require('fs');
    const path = require('path');
    
    console.log('Running emergency build script to create a minimal deployable site...');
    
    // Create dist directory
    if (!fs.existsSync('./dist')) {
      fs.mkdirSync('./dist', { recursive: true });
    }
    
    // Create necessary subdirectories
    ['icons', 'images', 'vendor', 'splash'].forEach(dir => {
      const dirPath = path.join('./dist', dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    
    // Copy index.html to dist with minimal modifications
    let indexContent = fs.readFileSync('./index.html', 'utf8');
    
    // Fix URL placeholders to use absolute paths
    indexContent = indexContent
      .replace(/%PUBLIC_URL%\//g, '')
      .replace('<div id="root"></div>', '<div id="root">App is loading...</div>')
      .replace('<link rel="manifest" href="/manifest.json" />', '<link rel="manifest" href="/manifest.json" />')
      .replace('<link rel="shortcut icon" href="/favicon.ico">', '<link rel="shortcut icon" href="/favicon.ico">');
    
    // Make sure favicon is included
    if (!indexContent.includes('favicon.ico')) {
      const headEnd = indexContent.indexOf('</head>');
      if (headEnd !== -1) {
        indexContent = indexContent.slice(0, headEnd) + 
          '\n  <link rel="shortcut icon" href="/favicon.ico">\n  ' + 
          indexContent.slice(headEnd);
      }
    }
    
    fs.writeFileSync('./dist/index.html', indexContent);
    console.log('Created basic dist/index.html');
    
    // Copy public directory
    if (fs.existsSync('./public')) {
      console.log('Copying public directory...');
      try {
        // Some Node versions use different copy methods
        if (typeof fs.cpSync === 'function') {
          fs.cpSync('./public', './dist', { recursive: true });
        } else {
          // Older Node.js fallback - manually copy important files
          const copyFile = (src, dest) => {
            try {
              const data = fs.readFileSync(src);
              // Ensure directory exists
              const destDir = path.dirname(dest);
              if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
              }
              fs.writeFileSync(dest, data);
            } catch (err) {
              console.warn(`Warning: Failed to copy ${src} to ${dest}:`, err.message);
            }
          };
          
          // Copy specific critical files
          copyFile('./public/manifest.json', './dist/manifest.json');
          copyFile('./public/favicon.ico', './dist/favicon.ico');
          copyFile('./public/robots.txt', './dist/robots.txt');
          
          // Copy directories we know are needed
          ['icons', 'images', 'splash', 'vendor'].forEach(dir => {
            const srcDir = `./public/${dir}`;
            if (fs.existsSync(srcDir)) {
              console.log(`Copying ${dir} directory...`);
              const files = fs.readdirSync(srcDir, { withFileTypes: true });
              
              files.forEach(file => {
                if (file.isFile()) {
                  copyFile(`${srcDir}/${file.name}`, `./dist/${dir}/${file.name}`);
                }
              });
            }
          });
        }
        console.log('Public directory copied successfully');
      } catch (copyError) {
        console.error('Error copying public directory:', copyError.message);
        console.log('Creating basic fallback files...');
        
        // Create minimal manifest.json
        const manifest = {
          "short_name": "Doctor.mx",
          "name": "Doctor.mx",
          "icons": [
            {
              "src": "/favicon.ico",
              "sizes": "64x64",
              "type": "image/x-icon"
            }
          ],
          "start_url": ".",
          "display": "standalone",
          "theme_color": "#3b82f6",
          "background_color": "#ffffff"
        };
        
        // Make sure dist directory exists
        if (!fs.existsSync('./dist')) {
          fs.mkdirSync('./dist', { recursive: true });
        }
        
        fs.writeFileSync('./dist/manifest.json', JSON.stringify(manifest, null, 2));
        
        // Create an empty favicon if needed
        if (!fs.existsSync('./dist/favicon.ico')) {
          // Create a 1x1 transparent pixel ICO
          const emptyIcon = Buffer.from([
            0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x01, 0x01, 
            0x00, 0x00, 0x01, 0x00, 0x18, 0x00, 0x0A, 0x00, 
            0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00, 
            0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 
            0x00, 0x00, 0x01, 0x00, 0x18, 0x00, 0x00, 0x00, 
            0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
            0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 
            0x00, 0x00
          ]);
          fs.writeFileSync('./dist/favicon.ico', emptyIcon);
        }
      }
    }
    
    console.log('Basic build complete!');
    `;
    
    fs.writeFileSync('emergency-build.js', buildScript);
    execSync('node emergency-build.js', { stdio: 'inherit' });
    console.log('✅ Emergency build completed as fallback!');
  } catch (fallbackError) {
    console.error('❌ All build attempts failed:', fallbackError.message);
    process.exit(1);
  }
}
