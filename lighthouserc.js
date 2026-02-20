/**
 * Lighthouse CI Configuration
 * 
 * This file configures Lighthouse CI for performance budget monitoring.
 * It runs Lighthouse audits against key pages and enforces performance budgets.
 * 
 * @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
 */

module.exports = {
  ci: {
    // Collection settings
    collect: {
      // URLs to audit
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/doctores',
        'http://localhost:3000/especialidades',
        'http://localhost:3000/nosotros',
        'http://localhost:3000/contacto'
      ],
      // Number of runs to average results
      numberOfRuns: 3,
      // Start server before running audits
      startServerCommand: 'npm run start',
      // Wait for server to be ready
      startServerReadyPattern: 'Ready',
      // Server ready timeout
      startServerReadyTimeout: 60000,
      // Settings for Lighthouse
      settings: {
        preset: 'desktop',
        throttling: {
          // Simulate fast 4G
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false
        },
        formFactor: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      }
    },
    
    // Assertion settings - Performance Budgets
    assert: {
      // Assertion preset
      preset: 'lighthouse:recommended',
      // Custom assertions
      assertions: {
        // Category scores
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],
        
        // Resource budgets
        'resource-summary:document:size': ['error', { maxNumericValue: 50000 }], // 50KB
        'resource-summary:script:size': ['error', { maxNumericValue: 200000 }], // 200KB
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 50000 }], // 50KB
        'resource-summary:image:size': ['error', { maxNumericValue: 500000 }], // 500KB
        'resource-summary:font:size': ['warn', { maxNumericValue: 300000 }], // 300KB
        'resource-summary:total:size': ['warn', { maxNumericValue: 2000000 }], // 2MB
        
        // Request counts
        'resource-summary:script:count': ['warn', { maxNumericValue: 30 }],
        'resource-summary:third-party:count': ['warn', { maxNumericValue: 10 }],
        
        // Performance diagnostics
        'unused-javascript': ['warn', { maxNumericValue: 0.5 }],
        'unused-css-rules': ['warn', { maxNumericValue: 0.3 }],
        'modern-image-formats': ['warn', { maxNumericValue: 0 }],
        'efficiently-encode-images': ['warn', { maxNumericValue: 0 }],
        'render-blocking-resources': ['warn', { maxNumericValue: 0 }],
        
        // Accessibility
        'color-contrast': ['error', { minScore: 1 }],
        'image-alt': ['error', { minScore: 1 }],
        'label': ['error', { minScore: 1 }],
        'tap-targets': ['warn', { minScore: 0.9 }],
        
        // Best practices
        'errors-in-console': ['error', { minScore: 1 }],
        'notification-on-start': ['warn', { minScore: 1 }],
        'password-inputs-can-be-pasted-into': ['error', { minScore: 1 }],
        
        // SEO
        'document-title': ['error', { minScore: 1 }],
        'meta-description': ['error', { minScore: 1 }],
        'http-status-code': ['error', { minScore: 1 }],
        'link-text': ['warn', { minScore: 0.9 }],
        'crawlable-anchors': ['error', { minScore: 1 }],
        'is-crawlable': ['error', { minScore: 1 }]
      }
    },
    
    // Upload settings
    upload: {
      // Upload target
      target: 'temporary-public-storage',
      // Output directory for reports
      outputDir: './lighthouse-reports',
      // GitHub status check
      githubStatusContextSuffix: '-lighthouse'
    },
    
    // Server settings
    server: {
      // Storage method
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './.lighthouseci/db.sql'
      }
    }
  }
};
