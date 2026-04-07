/**
 * Advanced Configuration Management System
 * Provides environment-specific configuration with inheritance
 * and intelligent resource allocation for testing infrastructure
 */

export interface TestEnvironment {
  name: string
  baseUrl: string
  timeout: number
  retries: number
  parallel: number
  headless: boolean
  trace: string
  screenshot: string
  video: boolean
}

export interface BrowserConfig {
  name: string
  viewport: { width: number; height: number }
  userAgent?: string
  locale?: string
  timezone?: string
}

export interface ThresholdConfig {
  coverage: {
    lines: number
    functions: number
    branches: number
    statements: number
  }
  performance: {
    responseTime: number
    firstContentfulPaint: number
    largestContentfulPaint: number
  }
  reliability: {
    passRate: number
    flakiness: number
  }
}

export interface TestConfig {
  environment: TestEnvironment
  browsers: BrowserConfig[]
  thresholds: ThresholdConfig
  features: {
    aiHealing: boolean
    visualRegression: boolean
    performanceTesting: boolean
    securityTesting: boolean
  }
  caching: {
    enabled: boolean
    ttl: number
    maxSize: number
  }
}

class ConfigurationManager {
  private configs: Map<string, TestConfig> = new Map()
  private currentEnvironment: string = 'development'

  constructor() {
    this.initializeConfigs()
  }

  private initializeConfigs(): void {
    // Development configuration
    this.configs.set('development', {
      environment: {
        name: 'development',
        baseUrl: 'http://localhost:3000',
        timeout: 30000,
        retries: 0,
        parallel: 4,
        headless: false,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: false
      },
      browsers: [
        {
          name: 'chromium',
          viewport: { width: 1280, height: 720 },
          locale: 'en-US',
          timezone: 'America/New_York'
        }
      ],
      thresholds: {
        coverage: { lines: 70, functions: 70, branches: 60, statements: 70 },
        performance: { responseTime: 2000, firstContentfulPaint: 1500, largestContentfulPaint: 2500 },
        reliability: { passRate: 90, flakiness: 10 }
      },
      features: {
        aiHealing: true,
        visualRegression: false,
        performanceTesting: false,
        securityTesting: false
      },
      caching: {
        enabled: true,
        ttl: 3600000, // 1 hour
        maxSize: 100 // MB
      }
    })

    // Staging configuration
    this.configs.set('staging', {
      environment: {
        name: 'staging',
        baseUrl: 'https://staging.rileydaycare.com',
        timeout: 45000,
        retries: 1,
        parallel: 6,
        headless: true,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: true
      },
      browsers: [
        {
          name: 'chromium',
          viewport: { width: 1280, height: 720 },
          locale: 'en-US',
          timezone: 'America/New_York'
        },
        {
          name: 'firefox',
          viewport: { width: 1280, height: 720 },
          locale: 'en-US',
          timezone: 'America/New_York'
        },
        {
          name: 'webkit',
          viewport: { width: 1280, height: 720 },
          locale: 'en-US',
          timezone: 'America/New_York'
        }
      ],
      thresholds: {
        coverage: { lines: 80, functions: 80, branches: 70, statements: 80 },
        performance: { responseTime: 1500, firstContentfulPaint: 1000, largestContentfulPaint: 2000 },
        reliability: { passRate: 95, flakiness: 5 }
      },
      features: {
        aiHealing: true,
        visualRegression: true,
        performanceTesting: true,
        securityTesting: true
      },
      caching: {
        enabled: true,
        ttl: 7200000, // 2 hours
        maxSize: 200 // MB
      }
    })

    // Production configuration
    this.configs.set('production', {
      environment: {
        name: 'production',
        baseUrl: 'https://rileydaycare.com',
        timeout: 60000,
        retries: 2,
        parallel: 8,
        headless: true,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: true
      },
      browsers: [
        {
          name: 'chromium',
          viewport: { width: 1280, height: 720 },
          locale: 'en-US',
          timezone: 'America/New_York'
        },
        {
          name: 'firefox',
          viewport: { width: 1280, height: 720 },
          locale: 'en-US',
          timezone: 'America/New_York'
        },
        {
          name: 'webkit',
          viewport: { width: 1280, height: 720 },
          locale: 'en-US',
          timezone: 'America/New_York'
        },
        {
          name: 'Mobile Chrome',
          viewport: { width: 375, height: 667 },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          locale: 'en-US',
          timezone: 'America/New_York'
        },
        {
          name: 'Mobile Safari',
          viewport: { width: 375, height: 667 },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          locale: 'en-US',
          timezone: 'America/New_York'
        }
      ],
      thresholds: {
        coverage: { lines: 85, functions: 85, branches: 75, statements: 85 },
        performance: { responseTime: 1000, firstContentfulPaint: 800, largestContentfulPaint: 1500 },
        reliability: { passRate: 98, flakiness: 2 }
      },
      features: {
        aiHealing: true,
        visualRegression: true,
        performanceTesting: true,
        securityTesting: true
      },
      caching: {
        enabled: true,
        ttl: 14400000, // 4 hours
        maxSize: 500 // MB
      }
    })
  }

  setEnvironment(environment: string): void {
    if (!this.configs.has(environment)) {
      throw new Error(`Environment '${environment}' not found`)
    }
    this.currentEnvironment = environment
  }

  getConfig(): TestConfig {
    const config = this.configs.get(this.currentEnvironment)
    if (!config) {
      throw new Error(`No configuration found for environment '${this.currentEnvironment}'`)
    }
    return config
  }

  getEnvironment(): TestEnvironment {
    return this.getConfig().environment
  }

  getBrowsers(): BrowserConfig[] {
    return this.getConfig().browsers
  }

  getThresholds(): ThresholdConfig {
    return this.getConfig().thresholds
  }

  getFeatures(): TestConfig['features'] {
    return this.getConfig().features
  }

  getCachingConfig(): TestConfig['caching'] {
    return this.getConfig().caching
  }

  /**
   * Intelligent resource allocation based on test requirements
   */
  allocateResources(testCount: number, testComplexity: 'low' | 'medium' | 'high'): {
    parallel: number
    timeout: number
    retries: number
    memory: string
  } {
    const config = this.getConfig()
    let { parallel, timeout, retries } = config.environment

    // Adjust based on test count
    if (testCount > 50) {
      parallel = Math.min(parallel * 2, 16)
    } else if (testCount < 10) {
      parallel = Math.max(parallel / 2, 1)
    }

    // Adjust based on complexity
    switch (testComplexity) {
      case 'high':
        timeout = timeout * 1.5
        retries = retries + 1
        break
      case 'medium':
        timeout = timeout * 1.2
        break
      case 'low':
        timeout = timeout * 0.8
        break
    }

    // Estimate memory requirements
    const memory = parallel > 8 ? '4GB' : parallel > 4 ? '2GB' : '1GB'

    return { parallel, timeout, retries, memory }
  }

  /**
   * Dynamic test selection based on code changes
   */
  selectTests(changedFiles: string[], allTests: string[]): string[] {
    const selectedTests: string[] = []
    
    for (const testFile of allTests) {
      // Simple heuristic: include tests that match changed file patterns
      for (const changedFile of changedFiles) {
        if (testFile.includes(changedFile.replace(/\.(ts|tsx|js|jsx)$/, ''))) {
          selectedTests.push(testFile)
          break
        }
      }
    }

    // Always include critical tests
    const criticalTests = allTests.filter(test => 
      test.includes('enrollment') || 
      test.includes('navigation') ||
      test.includes('api')
    )
    
    return [...new Set([...selectedTests, ...criticalTests])]
  }

  /**
   * Get configuration for specific browser
   */
  getBrowserConfig(browserName: string): BrowserConfig | undefined {
    return this.getBrowsers().find(browser => browser.name === browserName)
  }

  /**
   * Validate configuration against thresholds
   */
  validateThresholds(metrics: {
    coverage: { lines: number; functions: number; branches: number; statements: number }
    performance: { responseTime: number; firstContentfulPaint: number; largestContentfulPaint: number }
    reliability: { passRate: number; flakiness: number }
  }): { passed: boolean; failures: string[] } {
    const thresholds = this.getThresholds()
    const failures: string[] = []

    // Check coverage thresholds
    if (metrics.coverage.lines < thresholds.coverage.lines) {
      failures.push(`Lines coverage ${metrics.coverage.lines}% below threshold ${thresholds.coverage.lines}%`)
    }
    if (metrics.coverage.functions < thresholds.coverage.functions) {
      failures.push(`Functions coverage ${metrics.coverage.functions}% below threshold ${thresholds.coverage.functions}%`)
    }
    if (metrics.coverage.branches < thresholds.coverage.branches) {
      failures.push(`Branches coverage ${metrics.coverage.branches}% below threshold ${thresholds.coverage.branches}%`)
    }

    if (metrics.coverage.statements < thresholds.coverage.statements) {
      failures.push(`Statements coverage ${metrics.coverage.statements}% below threshold ${thresholds.coverage.statements}%`)
    }
    if (metrics.performance.responseTime > thresholds.performance.responseTime) {
      failures.push(`Response time ${metrics.performance.responseTime}ms above threshold ${thresholds.performance.responseTime}ms`)
    }
    if (metrics.performance.firstContentfulPaint > thresholds.performance.firstContentfulPaint) {
      failures.push(`FCP ${metrics.performance.firstContentfulPaint}ms above threshold ${thresholds.performance.firstContentfulPaint}ms`)
    }
    if (metrics.performance.largestContentfulPaint > thresholds.performance.largestContentfulPaint) {
      failures.push(`LCP ${metrics.performance.largestContentfulPaint}ms above threshold ${thresholds.performance.largestContentfulPaint}ms`)
    }
    // Check reliability thresholds
    if (metrics.reliability.passRate < thresholds.reliability.passRate) {
      failures.push(`Pass rate ${metrics.reliability.passRate}% below threshold ${thresholds.reliability.passRate}%`)
    }
    if (metrics.reliability.flakiness > thresholds.reliability.flakiness) {
      failures.push(`Flakiness ${metrics.reliability.flakiness}% above threshold ${thresholds.reliability.flakiness}%`)
    }

    return {
      passed: failures.length === 0,
      failures
    }
  }
}

// Singleton instance
export const configManager = new ConfigurationManager()

// Environment detection
export function detectEnvironment(): string {
  const env = process.env.NODE_ENV || process.env.TEST_ENV || 'development'
  
  // CI environment detection
  if (process.env.CI) {
    return 'staging'
  }
  
  // Production environment detection
  if (env === 'production') {
    return 'production'
  }
  
  return 'development'
}

// Auto-configure based on environment
export function autoConfigure(): void {
  const environment = detectEnvironment()
  configManager.setEnvironment(environment)
  console.log(`Test environment configured: ${environment}`)
}

export default ConfigurationManager
