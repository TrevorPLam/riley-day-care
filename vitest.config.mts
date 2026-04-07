import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { configManager, autoConfigure } from './testing-infrastructure/config/test-config'
import { getThresholds } from './testing-infrastructure/config/thresholds'

// Auto-configure based on environment
autoConfigure()

const config = configManager.getConfig()
const thresholds = getThresholds(config.environment.name)
const rootDir = fileURLToPath(new URL('./', import.meta.url))
const testingInfrastructureDir = fileURLToPath(new URL('./testing-infrastructure', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': rootDir,
      '@testing-infrastructure': testingInfrastructureDir,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./testing-infrastructure/unit/setup.ts'],
    include: ['testing-infrastructure/unit/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules/',
      '.next/',
      'dist/',
      'build/',
      'testing-infrastructure/e2e/**',
      'testing-infrastructure/integration/**',
      'testing-infrastructure/performance/**',
      'testing-infrastructure/security/**',
      'testing-infrastructure/visual/**',
    ],
    globals: true,
    maxWorkers: Math.max(1, config.environment.parallel),
    minWorkers: 1,
    hookTimeout: config.environment.timeout,
    testTimeout: config.environment.timeout,
    isolate: true,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        pretendToBeVisual: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'testing-infrastructure/artifacts/coverage',
      exclude: [
        'node_modules/',
        '.next/',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/build/**',
        'testing-infrastructure/e2e/**',
        'testing-infrastructure/integration/**',
        'testing-infrastructure/performance/**',
        'testing-infrastructure/security/**',
        'testing-infrastructure/visual/**',
        'testing-infrastructure/config/**',
        'testing-infrastructure/utils/**',
        '**/*.d.ts',
        '**/*.stories.*',
        '**/*.spec.*',
        '**/*.test.*',
      ],
      thresholds: {
        global: {
          statements: thresholds.coverage.statements,
          branches: thresholds.coverage.branches,
          functions: thresholds.coverage.functions,
          lines: thresholds.coverage.lines,
        },
        // Per-file thresholds for critical files
        'app/api/enrollment/route.ts': {
          statements: 90,
          branches: 85,
          functions: 90,
          lines: 90,
        },
        'components/shared/Button.tsx': {
          statements: 85,
          branches: 80,
          functions: 85,
          lines: 85,
        },
      },
      all: true,
      clean: true,
      cleanOnRerun: true,
    },
    reporters: [
      'verbose',
      'json',
      './testing-infrastructure/utils/vitest-reporter.ts',
    ],
    outputFile: {
      json: 'testing-infrastructure/artifacts/unit-test-results.json',
    },
    watch: !process.env.CI,
    bail: process.env.CI ? 1 : 0,
    passWithNoTests: false,
    logHeapUsage: true,
  },
  define: {
    'process.env.TEST_ENVIRONMENT': JSON.stringify(config.environment.name),
    'process.env.AI_HEALING': JSON.stringify(config.features.aiHealing),
    'process.env.VISUAL_REGRESSION': JSON.stringify(config.features.visualRegression),
  },
  optimizeDeps: {
    include: [
      'vitest',
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event',
      'jsdom',
    ],
  },
})
