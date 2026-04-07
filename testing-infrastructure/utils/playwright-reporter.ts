/**
 * Advanced Playwright Reporter
 * Comprehensive metrics, observability, and quality gate enforcement
 */

import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter'
import { promises as fs } from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { configManager } from '../config/test-config'
import { getThresholds } from '../config/thresholds'
import { parallelOptimizer } from './parallel-execution'
import { cacheManager } from './cache-manager'

interface TestMetrics {
  name: string
  status: 'passed' | 'failed' | 'skipped' | 'timedOut'
  duration: number
  retries: number
  startTime: number
  endTime: number
  browser: string
  viewport: { width: number; height: number }
  errors: Array<{
    message: string
    stack?: string
    location?: { file: string; line: number; column: number }
  }>
  attachments: Array<{
    name: string
    path: string
    contentType: string
  }>
  annotations: Array<{
    type: string
    description: string
  }>
  tags: string[]
  steps: Array<{
    title: string
    duration: number
    status: 'passed' | 'failed' | 'skipped'
    error?: string
  }>
}

interface SuiteMetrics {
  name: string
  tests: TestMetrics[]
  startTime: number
  endTime: number
  duration: number
  passed: number
  failed: number
  skipped: number
  timedOut: number
  flaky: number
  passRate: number
  averageDuration: number
  slowestTests: TestMetrics[]
  fastestTests: TestMetrics[]
  mostFlakyTests: TestMetrics[]
}

interface QualityMetrics {
  coverage?: {
    statements: number
    lines: number
    functions: number
    branches: number
  }
  performance?: {
    responseTime: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    cumulativeLayoutShift: number
    firstInputDelay: number
  }
  reliability: {
    passRate: number
    flakiness: number
    reliability: number
  }
  security?: {
    vulnerabilityCount: number
    criticalVulnerabilities: number
    highVulnerabilities: number
    securityScore: number
  }
  accessibility?: {
    wcagLevel: 'A' | 'AA' | 'AAA'
    violationCount: number
    criticalViolations: number
    accessibilityScore: number
  }
}

interface ExecutionSummary {
  environment: string
  timestamp: number
  duration: number
  totalTests: number
  passed: number
  failed: number
  skipped: number
  timedOut: number
  passRate: number
  flakiness: number
  reliability: number
  suites: SuiteMetrics[]
  qualityMetrics: QualityMetrics
  thresholds: {
    coverage: any
    performance: any
    reliability: any
    security: any
    accessibility: any
  }
  qualityGate: {
    passed: boolean
    failures: string[]
    warnings: string[]
  }
  performance: {
    parallelEfficiency: number
    cacheHitRate: number
    resourceUtilization: number
    averageTestDuration: number
  }
  recommendations: string[]
}

class AdvancedPlaywrightReporter implements Reporter {
  private suiteMetrics: Map<string, SuiteMetrics> = new Map()
  private currentSuite: string = ''
  private testResults: TestMetrics[] = []
  private startTime: number = 0
  private endTime: number = 0

  async onBegin(fullConfig: any): Promise<void> {
    this.startTime = Date.now()
    console.log('Starting advanced test execution...')
    
    // Initialize cache and parallel optimization
    await cacheManager.warmCache([])
    
    // Log configuration
    const config = configManager.getConfig()
    console.log(`Environment: ${config.environment.name}`)
    console.log(`Parallel workers: ${config.environment.parallel}`)
    console.log(`Features: ${JSON.stringify(config.features)}`)
  }

  async onTestBegin(test: TestCase): Promise<void> {
    const suiteName = this.getSuiteName(test)
    
    if (!this.suiteMetrics.has(suiteName)) {
      this.suiteMetrics.set(suiteName, {
        name: suiteName,
        tests: [],
        startTime: Date.now(),
        endTime: 0,
        duration: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        timedOut: 0,
        flaky: 0,
        passRate: 0,
        averageDuration: 0,
        slowestTests: [],
        fastestTests: [],
        mostFlakyTests: []
      })
    }

    this.currentSuite = suiteName
    console.log(`Starting test: ${test.title}`)
  }

  async onTestEnd(test: TestCase, result: TestResult): Promise<void> {
    const suite = this.suiteMetrics.get(this.currentSuite)
    if (!suite) return

    const testMetrics: TestMetrics = {
      name: test.title,
      status: result.status as any,
      duration: result.duration,
      retries: result.retry,
      startTime: result.startTime.getTime(),
      endTime: result.startTime.getTime() + result.duration,
      browser: 'unknown', // Project name extraction moved to different API in newer Playwright
      viewport: { width: 1280, height: 720 }, // Default, should be extracted from config
      errors: result.errors?.map(error => ({
        message: error.message || 'Unknown error',
        stack: error.stack,
        location: error.location
      })).filter(error => error.message) || [],
      attachments: result.attachments?.filter(att => att.path).map(att => ({
        name: att.name,
        path: att.path!,
        contentType: att.contentType
      })) || [],
      annotations: result.annotations?.filter(ann => ann.description).map(ann => ({
        type: ann.type,
        description: ann.description!
      })) || [],
      tags: test.tags || [],
      steps: result.steps?.map(step => ({
        title: step.title,
        duration: step.duration || 0,
        status: 'passed' as const,
        error: step.error?.message
      })) || []
    }

    suite.tests.push(testMetrics)
    this.testResults.push(testMetrics)

    // Update suite counters
    switch (result.status) {
      case 'passed':
        suite.passed++
        break
      case 'failed':
        suite.failed++
        break
      case 'skipped':
        suite.skipped++
        break
      case 'timedOut':
        suite.timedOut++
        break
    }

    // Record test execution for parallel optimization learning
    parallelOptimizer.recordTestExecution(test.title, result.duration, result.status === 'passed')

    // Cache test result
    await cacheManager.cacheTestResult(test.title, {
      testName: test.title,
      status: result.status as any,
      duration: result.duration,
      error: result.errors?.[0]?.message,
      metadata: {
        browser: 'unknown', // Project name extraction moved to different API in newer Playwright
        retries: result.retry,
        timestamp: Date.now()
      }
    })

    console.log(`Test completed: ${test.title} (${result.status}) - ${result.duration}ms`)
  }

  async onEnd(result: FullResult): Promise<void> {
    this.endTime = Date.now()
    
    console.log('Test execution completed. Generating comprehensive report...')
    
    // Calculate final metrics
    this.calculateSuiteMetrics()
    const summary = await this.generateExecutionSummary(result)
    
    // Generate reports
    await this.generateReports(summary)
    
    // Output summary
    this.printSummary(summary)
    
    // Check quality gates
    this.checkQualityGates(summary)
  }

  private getSuiteName(test: TestCase): string {
    const pathParts = test.titlePath()
    return pathParts.length > 1 ? pathParts[0] : 'default'
  }

  private calculateSuiteMetrics(): void {
    for (const suite of this.suiteMetrics.values()) {
      suite.endTime = Date.now()
      suite.duration = suite.endTime - suite.startTime
      suite.passRate = suite.tests.length > 0 ? (suite.passed / suite.tests.length) * 100 : 0
      suite.averageDuration = suite.tests.length > 0 
        ? suite.tests.reduce((sum, test) => sum + test.duration, 0) / suite.tests.length 
        : 0

      // Find flaky tests (tests that failed and were retried)
      suite.flaky = suite.tests.filter(test => test.retries > 0 && test.status === 'passed').length

      // Sort tests by duration
      suite.tests.sort((a, b) => b.duration - a.duration)
      suite.slowestTests = suite.tests.slice(0, 5)
      suite.fastestTests = suite.tests.slice(-5).reverse()

      // Sort tests by flakiness
      suite.tests.sort((a, b) => b.retries - a.retries)
      suite.mostFlakyTests = suite.tests.slice(0, 5)
    }
  }

  private async generateExecutionSummary(result: FullResult): Promise<ExecutionSummary> {
    const config = configManager.getConfig()
    const thresholds = getThresholds(config.environment.name)
    const cacheStats = cacheManager.getStats()
    const parallelStats = parallelOptimizer.getExecutionStats()

    const totalTests = this.testResults.length
    const passed = this.testResults.filter(t => t.status === 'passed').length
    const failed = this.testResults.filter(t => t.status === 'failed').length
    const skipped = this.testResults.filter(t => t.status === 'skipped').length
    const timedOut = this.testResults.filter(t => t.status === 'timedOut').length

    const passRate = totalTests > 0 ? (passed / totalTests) * 100 : 0
    const flakiness = totalTests > 0 ? (this.testResults.filter(t => t.retries > 0).length / totalTests) * 100 : 0
    const reliability = 100 - flakiness

    const qualityMetrics: QualityMetrics = {
      reliability: { passRate, flakiness, reliability }
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(passRate, flakiness, cacheStats, parallelStats)

    // Check quality gates
    const qualityGate = this.checkQualityGate(passRate, flakiness, thresholds)

    return {
      environment: config.environment.name,
      timestamp: Date.now(),
      duration: this.endTime - this.startTime,
      totalTests,
      passed,
      failed,
      skipped,
      timedOut,
      passRate,
      flakiness,
      reliability,
      suites: Array.from(this.suiteMetrics.values()),
      qualityMetrics,
      thresholds: {
        coverage: thresholds.coverage,
        performance: thresholds.performance,
        reliability: thresholds.reliability,
        security: thresholds.security,
        accessibility: thresholds.accessibility
      },
      qualityGate,
      performance: {
        parallelEfficiency: parallelStats.workerEfficiency * 100,
        cacheHitRate: cacheStats.hitRate,
        resourceUtilization: parallelStats.resourceUtilization,
        averageTestDuration: parallelStats.avgDuration
      },
      recommendations
    }
  }

  private generateRecommendations(
    passRate: number,
    flakiness: number,
    cacheStats: any,
    parallelStats: any
  ): string[] {
    const recommendations: string[] = []

    if (passRate < 90) {
      recommendations.push('Test pass rate is below 90%. Review failing tests and fix underlying issues.')
    }

    if (flakiness > 10) {
      recommendations.push('High test flakiness detected. Investigate unstable tests and improve test isolation.')
    }

    if (cacheStats.hitRate < 50) {
      recommendations.push('Cache hit rate is low. Consider optimizing test dependencies and caching strategies.')
    }

    if (parallelStats.workerEfficiency < 70) {
      recommendations.push('Parallel worker efficiency is low. Consider adjusting test distribution or resource allocation.')
    }

    if (parallelStats.avgDuration > 10000) {
      recommendations.push('Average test duration is high. Consider optimizing test performance and reducing test complexity.')
    }

    // Add recommendations from parallel optimizer
    const parallelRecommendations = parallelOptimizer.getOptimizationRecommendations()
    recommendations.push(...parallelRecommendations)

    return recommendations
  }

  private checkQualityGate(passRate: number, flakiness: number, thresholds: any): {
    passed: boolean
    failures: string[]
    warnings: string[]
  } {
    const failures: string[] = []
    const warnings: string[] = []

    // Check reliability thresholds
    if (passRate < thresholds.reliability.passRate) {
      failures.push(`Pass rate ${passRate.toFixed(2)}% below threshold ${thresholds.reliability.passRate}%`)
    }

    if (flakiness > thresholds.reliability.flakiness) {
      failures.push(`Flakiness ${flakiness.toFixed(2)}% above threshold ${thresholds.reliability.flakiness}%`)
    }

    // Warnings for near-threshold values
    if (passRate < thresholds.reliability.passRate + 5) {
      warnings.push(`Pass rate approaching threshold: ${passRate.toFixed(2)}%`)
    }

    if (flakiness > thresholds.reliability.flakiness - 2) {
      warnings.push(`Flakiness approaching threshold: ${flakiness.toFixed(2)}%`)
    }

    return {
      passed: failures.length === 0,
      failures,
      warnings
    }
  }

  private async generateReports(summary: ExecutionSummary): Promise<void> {
    const reportsDir = path.join(process.cwd(), 'testing-infrastructure/artifacts/reports')
    await fs.mkdir(reportsDir, { recursive: true })

    // Generate JSON report
    const jsonReport = path.join(reportsDir, `execution-summary-${Date.now()}.json`)
    await fs.writeFile(jsonReport, JSON.stringify(summary, null, 2))

    // Generate HTML report
    const htmlReport = path.join(reportsDir, `execution-summary-${Date.now()}.html`)
    const htmlContent = this.generateHTMLReport(summary)
    await fs.writeFile(htmlReport, htmlContent)

    // Generate metrics report
    const metricsReport = path.join(reportsDir, `metrics-${Date.now()}.json`)
    const metrics = this.extractMetrics(summary)
    await fs.writeFile(metricsReport, JSON.stringify(metrics, null, 2))

    console.log(`Reports generated in: ${reportsDir}`)
  }

  private generateHTMLReport(summary: ExecutionSummary): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Execution Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .metric-value { font-size: 2em; font-weight: bold; color: #333; }
        .metric-label { color: #666; margin-top: 5px; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        .recommendations { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .quality-gate { padding: 15px; border-radius: 5px; margin: 20px 0; }
        .quality-gate.passed { background: #d4edda; }
        .quality-gate.failed { background: #f8d7da; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Execution Summary</h1>
        <p><strong>Environment:</strong> ${summary.environment}</p>
        <p><strong>Timestamp:</strong> ${new Date(summary.timestamp).toLocaleString()}</p>
        <p><strong>Duration:</strong> ${(summary.duration / 1000).toFixed(2)}s</p>
    </div>

    <div class="metrics">
        <div class="metric-card">
            <div class="metric-value ${summary.passRate >= 90 ? 'success' : summary.passRate >= 70 ? 'warning' : 'error'}">${summary.passRate.toFixed(1)}%</div>
            <div class="metric-label">Pass Rate</div>
        </div>
        <div class="metric-card">
            <div class="metric-value ${summary.flakiness <= 5 ? 'success' : summary.flakiness <= 10 ? 'warning' : 'error'}">${summary.flakiness.toFixed(1)}%</div>
            <div class="metric-label">Flakiness</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${summary.totalTests}</div>
            <div class="metric-label">Total Tests</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${summary.failed}</div>
            <div class="metric-label">Failed Tests</div>
        </div>
    </div>

    <div class="quality-gate ${summary.qualityGate.passed ? 'passed' : 'failed'}">
        <h2>Quality Gate: ${summary.qualityGate.passed ? 'PASSED' : 'FAILED'}</h2>
        ${summary.qualityGate.failures.length > 0 ? `
            <h3>Failures:</h3>
            <ul>${summary.qualityGate.failures.map(f => `<li>${f}</li>`).join('')}</ul>
        ` : ''}
        ${summary.qualityGate.warnings.length > 0 ? `
            <h3>Warnings:</h3>
            <ul>${summary.qualityGate.warnings.map(w => `<li>${w}</li>`).join('')}</ul>
        ` : ''}
    </div>

    ${summary.recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>Recommendations</h2>
            <ul>${summary.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
        </div>
    ` : ''}

    <h2>Performance Metrics</h2>
    <div class="metrics">
        <div class="metric-card">
            <div class="metric-value">${summary.performance.parallelEfficiency.toFixed(1)}%</div>
            <div class="metric-label">Parallel Efficiency</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${summary.performance.cacheHitRate.toFixed(1)}%</div>
            <div class="metric-label">Cache Hit Rate</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${summary.performance.averageTestDuration.toFixed(0)}ms</div>
            <div class="metric-label">Avg Test Duration</div>
        </div>
    </div>

    <h2>Test Suites</h2>
    <table>
        <thead>
            <tr>
                <th>Suite</th>
                <th>Tests</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Pass Rate</th>
                <th>Duration</th>
                <th>Flaky</th>
            </tr>
        </thead>
        <tbody>
            ${summary.suites.map(suite => `
                <tr>
                    <td>${suite.name}</td>
                    <td>${suite.tests.length}</td>
                    <td>${suite.passed}</td>
                    <td>${suite.failed}</td>
                    <td>${suite.passRate.toFixed(1)}%</td>
                    <td>${(suite.duration / 1000).toFixed(2)}s</td>
                    <td>${suite.flaky}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
    `
  }

  private extractMetrics(summary: ExecutionSummary): any {
    return {
      timestamp: summary.timestamp,
      environment: summary.environment,
      summary: {
        totalTests: summary.totalTests,
        passed: summary.passed,
        failed: summary.failed,
        passRate: summary.passRate,
        flakiness: summary.flakiness,
        reliability: summary.reliability
      },
      performance: summary.performance,
      qualityGate: summary.qualityGate,
      suites: summary.suites.map(suite => ({
        name: suite.name,
        tests: suite.tests.length,
        passed: suite.passed,
        failed: suite.failed,
        passRate: suite.passRate,
        duration: suite.duration,
        flaky: suite.flaky
      }))
    }
  }

  private printSummary(summary: ExecutionSummary): void {
    console.log('\n' + '='.repeat(60))
    console.log('EXECUTION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Environment: ${summary.environment}`)
    console.log(`Duration: ${(summary.duration / 1000).toFixed(2)}s`)
    console.log(`Total Tests: ${summary.totalTests}`)
    console.log(`Passed: ${summary.passed} (${summary.passRate.toFixed(1)}%)`)
    console.log(`Failed: ${summary.failed}`)
    console.log(`Flakiness: ${summary.flakiness.toFixed(1)}%`)
    console.log(`Reliability: ${summary.reliability.toFixed(1)}%`)
    
    console.log('\nPerformance:')
    console.log(`Parallel Efficiency: ${summary.performance.parallelEfficiency.toFixed(1)}%`)
    console.log(`Cache Hit Rate: ${summary.performance.cacheHitRate.toFixed(1)}%`)
    console.log(`Average Test Duration: ${summary.performance.averageTestDuration.toFixed(0)}ms`)
    
    if (summary.recommendations.length > 0) {
      console.log('\nRecommendations:')
      summary.recommendations.forEach(rec => console.log(`- ${rec}`))
    }
    
    console.log('\nQuality Gate: ' + (summary.qualityGate.passed ? 'PASSED' : 'FAILED'))
    if (summary.qualityGate.failures.length > 0) {
      console.log('Failures:')
      summary.qualityGate.failures.forEach(failure => console.log(`- ${failure}`))
    }
    
    console.log('='.repeat(60))
  }

  private checkQualityGates(summary: ExecutionSummary): void {
    if (!summary.qualityGate.passed) {
      console.error('\nQUALITY GATES FAILED!')
      console.error('Failures:')
      summary.qualityGate.failures.forEach(failure => console.error(`- ${failure}`))
      
      // Exit with error code if in CI
      if (process.env.CI) {
        process.exit(1)
      }
    } else {
      console.log('\nAll quality gates passed!')
    }
  }
}

export default AdvancedPlaywrightReporter
