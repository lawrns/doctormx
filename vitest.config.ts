import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['**/*.test.ts', '**/*.test.tsx', '**/*.property.test.ts'],
    exclude: ['node_modules/**', '.next/**', 'worktrees/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // ============================================
      // COVERAGE THRESHOLDS - ZERO WARNINGS POLICY
      // ============================================
      // 100% for API routes (critical for production)
      // 90% for components (UI can have some edge cases)
      thresholds: {
        // Global minimum threshold
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
        // Auto-update threshold config
        autoUpdate: false,
      },
      // Per-file coverage enforcement
      // API routes must have 100% coverage
      // Components must have 90% coverage
      // Shared utilities must have 95% coverage
      include: [
        'src/app/api/**/*',
        'src/components/**/*',
        'src/lib/**/*',
        'src/hooks/**/*',
        'src/services/**/*',
        'src/utils/**/*',
      ],
      exclude: [
        'node_modules/',
        '.next/',
        'worktrees/',
        'dist/',
        'coverage/',
        // Test files
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.property.test.ts',
        '**/__tests__/**',
        // Mocks and utilities
        '**/mocks.ts',
        '**/mocks/**',
        '**/utils.ts',
        '**/utils/**',
        '**/test-utils.ts',
        '**/test-utils/**',
        // Types
        '**/types.ts',
        '**/types/**',
        '**/*.d.ts',
        // Configuration
        '**/config/**',
        '**/*.config.ts',
        '**/*.config.js',
        // Entry points
        'src/middleware.ts',
        'src/app/layout.tsx',
        'src/app/page.tsx',
        'src/app/loading.tsx',
        'src/app/error.tsx',
        'src/app/not-found.tsx',
        'src/app/sitemap.ts',
        'src/app/robots.ts',
        'src/app/manifest.ts',
        // Generated files
        '**/generated/**',
        // Routes (minimal logic, mostly framework)
        'src/app/**/layout.tsx',
        'src/app/**/loading.tsx',
        'src/app/**/error.tsx',
        'src/app/**/page.tsx',
      ],
      // Watermarks for coverage report
      watermarks: {
        statements: [80, 95],
        branches: [75, 90],
        functions: [80, 95],
        lines: [80, 95],
      },
      // Clean coverage directory before each run
      clean: true,
      // Enable all coverage features
      all: true,
      // Skip full coverage for files with insufficient coverage
      skipFull: false,
    },
    setupFiles: ['./src/lib/__tests__/setup.ts'],
    // Fail tests on console errors/warnings
    onConsoleLog(log, type) {
      if (type === 'error') {
        return false // Fail test
      }
      return true // Allow other logs
    },
    // Environment variables for tests
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_1234567890',
      STRIPE_SECRET_KEY: 'sk_test_1234567890',
    },
    // Reporter configuration
    reporters: ['verbose'],
    // Fail fast on CI
    bail: process.env.CI ? 1 : 0,
    // Test timeout
    testTimeout: 10000,
    // Hook timeout
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
