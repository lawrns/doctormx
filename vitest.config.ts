import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.property.test.ts'],
    exclude: ['node_modules/**', '.next/**', 'worktrees/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      exclude: [
        'node_modules/',
        '.next/',
        'worktrees/',
        'dist/',
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
