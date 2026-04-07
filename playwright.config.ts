import { defineConfig, devices } from '@playwright/test'
import { configManager, autoConfigure } from './testing-infrastructure/config/test-config'
import { getBrowserProfile, getBrowserSet } from './testing-infrastructure/config/browsers'

// Auto-configure based on environment
autoConfigure()

const config = configManager.getConfig()
const crossBrowserProfiles = getBrowserSet('cross-browser')
const mobileChrome = getBrowserProfile('mobile-chrome')
const mobileSafari = getBrowserProfile('mobile-safari')
const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

export default defineConfig({
  testDir: './testing-infrastructure/e2e/features',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: config.environment.retries,
  workers: process.env.CI ? 1 : Math.max(1, config.environment.parallel),
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    headless: config.environment.headless,
    trace: config.environment.trace as 'on' | 'off' | 'retain-on-failure' | 'on-first-retry',
    screenshot: config.environment.screenshot as 'off' | 'only-on-failure',
    video: config.environment.video ? 'retain-on-failure' : 'off',
    ignoreHTTPSErrors: true,
    actionTimeout: config.environment.timeout,
    navigationTimeout: config.environment.timeout,
    extraHTTPHeaders: {
      'x-playwright-test-run': testRunId,
    },
  },
  projects: [
    ...crossBrowserProfiles.map((browserProfile) => ({
      name: browserProfile.name,
      use: {
        ...devices[browserProfile.name === 'chromium' ? 'Desktop Chrome' : 
               browserProfile.name === 'firefox' ? 'Desktop Firefox' : 
               'Desktop Safari'],
        viewport: browserProfile.viewport,
        userAgent: browserProfile.userAgent,
        locale: browserProfile.locale,
        timezoneId: browserProfile.timezone,
        colorScheme: browserProfile.colorScheme,
        reducedMotion: browserProfile.reducedMotion,
      },
      testMatch: '**/*.spec.ts',
    })),

    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: mobileChrome.viewport,
        userAgent: mobileChrome.userAgent,
        isMobile: mobileChrome.isMobile,
        hasTouch: mobileChrome.hasTouch,
        deviceScaleFactor: mobileChrome.deviceScaleFactor,
      },
      testMatch: '**/*.spec.ts',
    },

    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
        viewport: mobileSafari.viewport,
        userAgent: mobileSafari.userAgent,
        isMobile: mobileSafari.isMobile,
        hasTouch: mobileSafari.hasTouch,
        deviceScaleFactor: mobileSafari.deviceScaleFactor,
      },
      testMatch: '**/*.spec.ts',
    },

    {
      name: 'accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: '**/*.accessibility.spec.ts',
      grep: new RegExp(/@accessibility|accessibility/i),
    },

    {
      name: 'visual',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: '**/*.visual.spec.ts',
      grep: new RegExp(/@visual|visual/i),
    },

    {
      name: 'performance',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: '**/*.performance.spec.ts',
      grep: new RegExp(/@performance|performance/i),
    },

    {
      name: 'security',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: '**/*.security.spec.ts',
      grep: new RegExp(/@security|security/i),
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  globalSetup: './testing-infrastructure/e2e/global-setup.ts',
  globalTeardown: './testing-infrastructure/e2e/global-teardown.ts',
  outputDir: 'testing-infrastructure/artifacts/test-results',
  timeout: config.environment.timeout,
  expect: {
    timeout: Math.floor(config.environment.timeout / 3),
  },
  metadata: {
    'test-environment': config.environment.name,
    'ai-healing': config.features.aiHealing,
    'visual-regression': config.features.visualRegression,
    'performance-testing': config.features.performanceTesting,
    'security-testing': config.features.securityTesting,
  },
  grepInvert: new RegExp(/@skip|@disabled/i),
  testIgnore: [
    '**/*.enhanced.spec.ts',
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
  ],
  reporter: [
    ['html', { 
      outputFolder: 'testing-infrastructure/artifacts/playwright-report', 
      open: process.env.CI ? 'never' : 'on-failure' 
    }],
    ['json', { outputFile: 'testing-infrastructure/artifacts/test-results.json' }],
    ['junit', { outputFile: 'testing-infrastructure/artifacts/test-results.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],
})
