/**
 * Quality Thresholds Configuration
 * Defines quality gates and performance benchmarks for different environments
 */

export interface CoverageThresholds {
  statements: number
  lines: number
  functions: number
  branches: number
}

export interface PerformanceThresholds {
  responseTime: number // ms
  firstContentfulPaint: number // ms
  largestContentfulPaint: number // ms
  cumulativeLayoutShift: number
  firstInputDelay: number // ms
}

export interface ReliabilityThresholds {
  passRate: number // percentage
  flakiness: number // percentage
  maxRetries: number
  timeout: number // ms
}

export interface SecurityThresholds {
  vulnerabilityCount: number
  criticalVulnerabilities: number
  highVulnerabilities: number
  securityScore: number // 0-100
}

export interface AccessibilityThresholds {
  wcagLevel: 'A' | 'AA' | 'AAA'
  violationCount: number
  criticalViolations: number
  accessibilityScore: number // 0-100
}

export interface QualityThresholds {
  coverage: CoverageThresholds
  performance: PerformanceThresholds
  reliability: ReliabilityThresholds
  security: SecurityThresholds
  accessibility: AccessibilityThresholds
}

export const thresholdProfiles: Record<string, QualityThresholds> = {
  // Development thresholds - relaxed for rapid iteration
  development: {
    coverage: {
      statements: 60,
      lines: 60,
      functions: 60,
      branches: 50
    },
    performance: {
      responseTime: 3000,
      firstContentfulPaint: 2000,
      largestContentfulPaint: 3500,
      cumulativeLayoutShift: 0.3,
      firstInputDelay: 100
    },
    reliability: {
      passRate: 85,
      flakiness: 15,
      maxRetries: 0,
      timeout: 30000
    },
    security: {
      vulnerabilityCount: 10,
      criticalVulnerabilities: 0,
      highVulnerabilities: 2,
      securityScore: 70
    },
    accessibility: {
      wcagLevel: 'A',
      violationCount: 20,
      criticalViolations: 5,
      accessibilityScore: 70
    }
  },

  // Staging thresholds - moderate standards
  staging: {
    coverage: {
      statements: 80,
      lines: 80,
      functions: 80,
      branches: 70
    },
    performance: {
      responseTime: 2000,
      firstContentfulPaint: 1500,
      largestContentfulPaint: 2500,
      cumulativeLayoutShift: 0.2,
      firstInputDelay: 80
    },
    reliability: {
      passRate: 95,
      flakiness: 5,
      maxRetries: 1,
      timeout: 45000
    },
    security: {
      vulnerabilityCount: 5,
      criticalVulnerabilities: 0,
      highVulnerabilities: 1,
      securityScore: 85
    },
    accessibility: {
      wcagLevel: 'AA',
      violationCount: 10,
      criticalViolations: 2,
      accessibilityScore: 85
    }
  },

  // Production thresholds - strict standards
  production: {
    coverage: {
      statements: 85,
      lines: 85,
      functions: 85,
      branches: 75
    },
    performance: {
      responseTime: 1500,
      firstContentfulPaint: 1000,
      largestContentfulPaint: 2000,
      cumulativeLayoutShift: 0.1,
      firstInputDelay: 60
    },
    reliability: {
      passRate: 98,
      flakiness: 2,
      maxRetries: 2,
      timeout: 60000
    },
    security: {
      vulnerabilityCount: 2,
      criticalVulnerabilities: 0,
      highVulnerabilities: 0,
      securityScore: 95
    },
    accessibility: {
      wcagLevel: 'AA',
      violationCount: 5,
      criticalViolations: 1,
      accessibilityScore: 95
    }
  },

  // Enterprise thresholds - ultra-strict standards
  enterprise: {
    coverage: {
      statements: 90,
      lines: 90,
      functions: 90,
      branches: 80
    },
    performance: {
      responseTime: 1000,
      firstContentfulPaint: 800,
      largestContentfulPaint: 1500,
      cumulativeLayoutShift: 0.05,
      firstInputDelay: 40
    },
    reliability: {
      passRate: 99,
      flakiness: 1,
      maxRetries: 3,
      timeout: 90000
    },
    security: {
      vulnerabilityCount: 1,
      criticalVulnerabilities: 0,
      highVulnerabilities: 0,
      securityScore: 98
    },
    accessibility: {
      wcagLevel: 'AAA',
      violationCount: 2,
      criticalViolations: 0,
      accessibilityScore: 98
    }
  }
}

export function getThresholds(profileName: string): QualityThresholds {
  const thresholds = thresholdProfiles[profileName]
  if (!thresholds) {
    throw new Error(`Threshold profile '${profileName}' not found`)
  }
  return thresholds
}

export function validateCoverage(
  actual: CoverageThresholds,
  expected: CoverageThresholds
): { passed: boolean; failures: string[] } {
  const failures: string[] = []

  if (actual.statements < expected.statements) {
    failures.push(`Statements coverage ${actual.statements}% below threshold ${expected.statements}%`)
  }
  if (actual.lines < expected.lines) {
    failures.push(`Lines coverage ${actual.lines}% below threshold ${expected.lines}%`)
  }
  if (actual.functions < expected.functions) {
    failures.push(`Functions coverage ${actual.functions}% below threshold ${expected.functions}%`)
  }
  if (actual.branches < expected.branches) {
    failures.push(`Branches coverage ${actual.branches}% below threshold ${expected.branches}%`)
  }

  return {
    passed: failures.length === 0,
    failures
  }
}

export function validatePerformance(
  actual: PerformanceThresholds,
  expected: PerformanceThresholds
): { passed: boolean; failures: string[] } {
  const failures: string[] = []

  if (actual.responseTime > expected.responseTime) {
    failures.push(`Response time ${actual.responseTime}ms above threshold ${expected.responseTime}ms`)
  }
  if (actual.firstContentfulPaint > expected.firstContentfulPaint) {
    failures.push(`FCP ${actual.firstContentfulPaint}ms above threshold ${expected.firstContentfulPaint}ms`)
  }
  if (actual.largestContentfulPaint > expected.largestContentfulPaint) {
    failures.push(`LCP ${actual.largestContentfulPaint}ms above threshold ${expected.largestContentfulPaint}ms`)
  }
  if (actual.cumulativeLayoutShift > expected.cumulativeLayoutShift) {
    failures.push(`CLS ${actual.cumulativeLayoutShift} above threshold ${expected.cumulativeLayoutShift}`)
  }
  if (actual.firstInputDelay > expected.firstInputDelay) {
    failures.push(`FID ${actual.firstInputDelay}ms above threshold ${expected.firstInputDelay}ms`)
  }

  return {
    passed: failures.length === 0,
    failures
  }
}

export function validateReliability(
  actual: ReliabilityThresholds,
  expected: ReliabilityThresholds
): { passed: boolean; failures: string[] } {
  const failures: string[] = []

  if (actual.passRate < expected.passRate) {
    failures.push(`Pass rate ${actual.passRate}% below threshold ${expected.passRate}%`)
  }
  if (actual.flakiness > expected.flakiness) {
    failures.push(`Flakiness ${actual.flakiness}% above threshold ${expected.flakiness}%`)
  }
  if (actual.maxRetries > expected.maxRetries) {
    failures.push(`Max retries ${actual.maxRetries} above threshold ${expected.maxRetries}`)
  }
  if (actual.timeout > expected.timeout) {
    failures.push(`Timeout ${actual.timeout}ms above threshold ${expected.timeout}ms`)
  }
  return {
    passed: failures.length === 0,
    failures
  }
}

export function validateSecurity(
  actual: SecurityThresholds,
  expected: SecurityThresholds
): { passed: boolean; failures: string[] } {
  const failures: string[] = []

  if (actual.vulnerabilityCount > expected.vulnerabilityCount) {
    failures.push(`Vulnerability count ${actual.vulnerabilityCount} above threshold ${expected.vulnerabilityCount}`)
  }
  if (actual.criticalVulnerabilities > expected.criticalVulnerabilities) {
    failures.push(`Critical vulnerabilities ${actual.criticalVulnerabilities} above threshold ${expected.criticalVulnerabilities}`)
  }
  if (actual.highVulnerabilities > expected.highVulnerabilities) {
    failures.push(`High vulnerabilities ${actual.highVulnerabilities} above threshold ${expected.highVulnerabilities}`)
  }
  if (actual.securityScore < expected.securityScore) {
    failures.push(`Security score ${actual.securityScore} below threshold ${expected.securityScore}`)
  }

  return {
    passed: failures.length === 0,
    failures
  }
}

export function validateAccessibility(
  actual: AccessibilityThresholds,
  expected: AccessibilityThresholds
): { passed: boolean; failures: string[] } {
  const failures: string[] = []

  if (actual.violationCount > expected.violationCount) {
    failures.push(`Violation count ${actual.violationCount} above threshold ${expected.violationCount}`)
  }
  if (actual.criticalViolations > expected.criticalViolations) {
    failures.push(`Critical violations ${actual.criticalViolations} above threshold ${expected.criticalViolations}`)
  }
  if (actual.accessibilityScore < expected.accessibilityScore) {
    failures.push(`Accessibility score ${actual.accessibilityScore} below threshold ${expected.accessibilityScore}`)
  }

  // WCAG level validation
  const wcagLevels = ['A', 'AA', 'AAA'] as const
  const actualIndex = wcagLevels.indexOf(actual.wcagLevel)
  const expectedIndex = wcagLevels.indexOf(expected.wcagLevel)
  
  if (actualIndex < expectedIndex) {
    failures.push(`WCAG level ${actual.wcagLevel} below required level ${expected.wcagLevel}`)
  }

  return {
    passed: failures.length === 0,
    failures
  }
}

export function validateAllThresholds(
  actual: Partial<QualityThresholds>,
  profileName: string
): { passed: boolean; failures: string[]; categoryResults: Record<string, { passed: boolean; failures: string[] }> } {
  const expected = getThresholds(profileName)
  const allFailures: string[] = []
  const categoryResults: Record<string, { passed: boolean; failures: string[] }> = {}

  const requiredCategories: (keyof QualityThresholds)[] = [
    'coverage',
    'performance',
    'reliability',
    'security',
    'accessibility'
  ]

  for (const category of requiredCategories) {
    if (!actual[category]) {
      const message = `Missing required metrics for ${category}`
      allFailures.push(message)
      categoryResults[category] = { passed: false, failures: [message] }
    }
  }

  if (actual.coverage) {
    const result = validateCoverage(actual.coverage, expected.coverage)
    categoryResults.coverage = result
    allFailures.push(...result.failures)
  }

  if (actual.performance) {
    const result = validatePerformance(actual.performance, expected.performance)
    categoryResults.performance = result
    allFailures.push(...result.failures)
  }

  if (actual.reliability) {
    const result = validateReliability(actual.reliability, expected.reliability)
    categoryResults.reliability = result
    allFailures.push(...result.failures)
  }

  if (actual.security) {
    const result = validateSecurity(actual.security, expected.security)
    categoryResults.security = result
    allFailures.push(...result.failures)
  }

  if (actual.accessibility) {
    const result = validateAccessibility(actual.accessibility, expected.accessibility)
    categoryResults.accessibility = result
    allFailures.push(...result.failures)
  }

  return {
    passed: allFailures.length === 0,
    failures: allFailures,
    categoryResults
  }
}

export function getAllThresholdProfiles(): Record<string, QualityThresholds> {
  return thresholdProfiles
}

export default thresholdProfiles
