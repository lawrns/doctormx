import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.property.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Current repository-wide coverage baseline. Keep this as a real regression
      // guard and raise it intentionally as coverage improves.
      thresholds: {
        lines: 40,
        functions: 45,
        branches: 33,
        statements: 40,
      },
      exclude: [
        'node_modules/',
        '.next/',
        '**/*.test.ts',
        '**/*.property.test.ts',
        '**/mocks.ts',
        '**/utils.ts',
        '**/types.ts',
      ],
    },
    setupFiles: ['./src/lib/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
