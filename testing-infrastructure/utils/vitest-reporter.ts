/**
 * Advanced Vitest Reporter
 * Comprehensive metrics, performance tracking, and quality gate enforcement for unit tests
 */

import { Reporter, Vitest, Task, FileTask } from 'vitest/node'
import { promises as fs } from 'fs'
import path from 'path'
import { configManager } from '../config/test-config'
import { getThresholds } from '../config/thresholds'
import { cacheManager } from './cache-manager'

interface UnitTestMetrics {
  name: string
  status: 'pass' | 'fail' | 'skip' | 'todo'
  duration: number
  startTime: number
  endTime: number
  errors: Array<{
    message: string
    stack?: string
    location?: { file: string; line: number; column: number }
  }>
  coverage?: {
    statements: number
    lines: number
    functions: number
    branches: number
  }
  memoryUsage?: {
    before: number
    after: number
    peak: number
  }
  testFilePath: string
}

interface UnitSuiteMetrics {
  name: string
  filePath: string
  tests: UnitTestMetrics[]
  startTime: number
  endTime: number
  duration: number
  passed: number
  failed: number
  skipped: number
  todo: number
  passRate: number
  averageDuration: number
  slowestTests: UnitTestMetrics[]
  fastestTests: UnitTestMetrics[]
  memoryEfficiency: number
}

interface UnitExecutionSummary {
  environment: string
  timestamp: number
  duration: number
  totalTests: number
  passed: number
  failed: number
  skipped: number
  todo: number
  passRate: number
  suites: UnitSuiteMetrics[]
  coverage?: {
    statements: number
    lines: number
    functions: number
    branches: number
  }
  performance: {
    cacheHitRate: number
    averageTestDuration: number
    memoryEfficiency: number
    parallelEfficiency: number
  }
  qualityGate: {
    passed: boolean
    failures: string[]
    warnings: string[]
  }
  recommendations: string[]
}

class AdvancedVitestReporter implements Reporter {
  private suiteMetrics: Map<string, UnitSuiteMetrics> = new Map()
  private testResults: UnitTestMetrics[] = []
  private startTime: number = 0
  private endTime: number = 0
  private vitest: Vitest | null = null

  async onInit(vitest: Vitest): Promise<void> {
    this.vitest = vitest
    this.startTime = Date.now()
    
    console.log('Starting advanced unit test execution...')
    
    // Log configuration
    const config = configManager.getConfig()
    console.log(`Environment: ${config.environment.name}`)
    console.log(`Parallel workers: ${config.environment.parallel}`)
    console.log(`AI Healing: ${config.features.aiHealing}`)
  }

  async onFilesStart(files: FileTask[]): Promise<void> {
    console.log(`Processing ${files.length} test files...`)
    
    // Initialize suite metrics
    for (const file of files) {
      const suiteName = this.getSuiteName(file.name)
      
      this.suiteMetrics.set(suiteName, {
        name: suiteName,
        filePath: file.name,
        tests: [],
        startTime: Date.now(),
        endTime: 0,
        duration: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        todo: 0,
        passRate: 0,
        averageDuration: 0,
        slowestTests: [],
        fastestTests: [],
        memoryEfficiency: 0
      })
    }
  }

  async onTaskUpdate(task: Task): Promise<void> {
    if (task.type === 'test' && task.result) {
      const suiteName = this.getSuiteName(task.file?.name || '')
      const suite = this.suiteMetrics.get(suiteName)
      
      if (!suite) return

      // Get memory usage if available
      const memoryUsage = this.getMemoryUsage()

      const testMetrics: UnitTestMetrics = {
        name: task.name,
        status: task.result?.state as any || 'skip',
        duration: task.result?.duration || 0,
        startTime: task.result?.startTime ? new Date(task.result.startTime).getTime() : Date.now(),
        endTime: task.result?.startTime ? new Date(task.result.startTime).getTime() + (task.result?.duration || 0) : Date.now(),
        errors: task.result?.errors?.map(error => ({
          message: error.message,
          stack: error.stack,
          location: error.location
        })) || [],
        testFilePath: task.file?.name || '',
        memoryUsage
      }

      suite.tests.push(testMetrics)
      this.testResults.push(testMetrics)

      // Update suite counters
      switch (testMetrics.status) {
        case 'pass':
          suite.passed++
          break
        case 'fail':
          suite.failed++
          break
        case 'skip':
          suite.skipped++
          break
        case 'todo':
          suite.todo++
          break
      }

      // Cache test result
      await cacheManager.cacheTestResult(task.name, {
        testName: task.name,
        status: testMetrics.status,
        duration: testMetrics.duration,
        error: testMetrics.errors[0]?.message,
        metadata: {
          filePath: task.file?.name,
          memoryUsage,
          timestamp: Date.now()
        }
      })

      console.log(`Test completed: ${task.name} (${testMetrics.status}) - ${testMetrics.duration}ms`)
    }
  }

  async onFinished(files: FileTask[]): Promise<void> {
    this.endTime = Date.now()
    
    console.log('Unit test execution completed. Generating comprehensive report...')
    
    // Calculate final metrics
    this.calculateSuiteMetrics()
    const summary = await this.generateExecutionSummary(files)
    
    // Generate reports
    await this.generateReports(summary)
    
    // Output summary
    this.printSummary(summary)
    
    // Check quality gates
    this.checkQualityGates(summary)
  }

  private getSuiteName(filePath: string): string {
    const parts = filePath.split('/')
    return parts[parts.length - 2] || 'default'
  }

  private getMemoryUsage(): { before: number; after: number; peak: number } | undefined {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      return {
        before: usage.heapUsed,
        after: usage.heapUsed,
        peak: usage.heapTotal
      }
    }
    return undefined
  }

  private calculateSuiteMetrics(): void {
    for (const suite of this.suiteMetrics.values()) {
      suite.endTime = Date.now()
      suite.duration = suite.endTime - suite.startTime
      suite.passRate = suite.tests.length > 0 ? (suite.passed / suite.tests.length) * 100 : 0
      suite.averageDuration = suite.tests.length > 0 
        ? suite.tests.reduce((sum, test) => sum + test.duration, 0) / suite.tests.length 
        : 0

      // Calculate memory efficiency
      const memoryUsages = suite.tests.map(test => test.memoryUsage).filter(Boolean)
      if (memoryUsages.length > 0) {
        const avgMemory = memoryUsages.reduce((sum, mem) => sum + mem!.after, 0) / memoryUsages.length
        suite.memoryEfficiency = avgMemory > 0 ? (suite.averageDuration / avgMemory) * 100 : 0
      }

      // Sort tests by duration
      suite.tests.sort((a, b) => b.duration - a.duration)
      suite.slowestTests = suite.tests.slice(0, 5)
      suite.fastestTests = suite.tests.slice(-5).reverse()
    }
  }

  private async generateExecutionSummary(files: FileTask[]): Promise<UnitExecutionSummary> {
    const config = configManager.getConfig()
    const thresholds = getThresholds(config.environment.name)
    const cacheStats = cacheManager.getStats()

    const totalTests = this.testResults.length
    const passed = this.testResults.filter(t => t.status === 'pass').length
    const failed = this.testResults.filter(t => t.status === 'fail').length
    const skipped = this.testResults.filter(t => t.status === 'skip').length
    const todo = this.testResults.filter(t => t.status === 'todo').length

    const passRate = totalTests > 0 ? (passed / totalTests) * 100 : 0

    // Get coverage from Vitest if available
    let coverage
    if (this.vitest) {
      const coverageProvider = this.vitest.config.coverage
      if (coverageProvider) {
        // This would need to be implemented based on Vitest's coverage API
        coverage = {
          statements: 0,
          lines: 0,
          functions: 0,
          branches: 0
        }
      }
    }

    const performance = {
      cacheHitRate: cacheStats.hitRate,
      averageTestDuration: this.testResults.length > 0 
        ? this.testResults.reduce((sum, test) => sum + test.duration, 0) / this.testResults.length 
        : 0,
      memoryEfficiency: this.calculateAverageMemoryEfficiency(),
      parallelEfficiency: this.calculateParallelEfficiency(files.length)
    }

    const recommendations = this.generateRecommendations(passRate, performance, cacheStats)
    const qualityGate = this.checkQualityGate(passRate, thresholds)

    return {
      environment: config.environment.name,
      timestamp: Date.now(),
      duration: this.endTime - this.startTime,
      totalTests,
      passed,
      failed,
      skipped,
      todo,
      passRate,
      suites: Array.from(this.suiteMetrics.values()),
      coverage,
      performance,
      qualityGate,
      recommendations
    }
  }

  private calculateAverageMemoryEfficiency(): number {
    const efficiencies = Array.from(this.suiteMetrics.values())
      .map(suite => suite.memoryEfficiency)
      .filter(eff => eff > 0)
    
    return efficiencies.length > 0 ? efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length : 0
  }

  private calculateParallelEfficiency(fileCount: number): number {
    // Simple calculation based on ideal vs actual execution time
    const config = configManager.getConfig()
    const idealTime = this.testResults.length > 0 
      ? Math.max(...this.testResults.map(test => test.duration))
      : 0
    
    const actualTime = this.endTime - this.startTime
    const workers = config.environment.parallel
    
    if (idealTime > 0 && workers > 1) {
      return Math.min((idealTime * workers) / actualTime, 100)
    }
    
    return 100
  }

  private generateRecommendations(
    passRate: number,
    performance: any,
    cacheStats: any
  ): string[] {
    const recommendations: string[] = []

    if (passRate < 90) {
      recommendations.push('Unit test pass rate is below 90%. Review failing tests and fix underlying issues.')
    }

    if (performance.averageTestDuration > 5000) {
      recommendations.push('Average unit test duration is high. Consider optimizing test performance and reducing test complexity.')
    }

    if (cacheStats.hitRate < 50) {
      recommendations.push('Cache hit rate is low. Consider optimizing test dependencies and caching strategies.')
    }

    if (performance.memoryEfficiency < 50) {
      recommendations.push('Memory efficiency is low. Review test memory usage and optimize test cleanup.')
    }

    return recommendations
  }

  private checkQualityGate(passRate: number, thresholds: any): {
    passed: boolean
    failures: string[]
    warnings: string[]
  } {
    const failures: string[] = []
    const warnings: string[] = []

    // Check reliability thresholds
    if (passRate < thresholds.reliability.passRate) {
      failures.push(`Unit test pass rate ${passRate.toFixed(2)}% below threshold ${thresholds.reliability.passRate}%`)
    }

    // Warnings for near-threshold values
    if (passRate < thresholds.reliability.passRate + 5) {
      warnings.push(`Unit test pass rate approaching threshold: ${passRate.toFixed(2)}%`)
    }

    return {
      passed: failures.length === 0,
      failures,
      warnings
    }
  }

  private async generateReports(summary: UnitExecutionSummary): Promise<void> {
    const reportsDir = path.join(process.cwd(), 'testing-infrastructure/artifacts/reports')
    await fs.mkdir(reportsDir, { recursive: true })

    // Generate JSON report
    const jsonReport = path.join(reportsDir, `unit-test-summary-${Date.now()}.json`)
    await fs.writeFile(jsonReport, JSON.stringify(summary, null, 2))

    // Generate HTML report
    const htmlReport = path.join(reportsDir, `unit-test-summary-${Date.now()}.html`)
    const htmlContent = this.generateHTMLReport(summary)
    await fs.writeFile(htmlReport, htmlContent)

    console.log(`Unit test reports generated in: ${reportsDir}`)
  }

  private generateHTMLReport(summary: UnitExecutionSummary): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Unit Test Execution Summary</title>
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
        <h1>Unit Test Execution Summary</h1>
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
            <div class="metric-value">${summary.totalTests}</div>
            <div class="metric-label">Total Tests</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${summary.failed}</div>
            <div class="metric-label">Failed Tests</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${summary.performance.averageTestDuration.toFixed(0)}ms</div>
            <div class="metric-label">Avg Duration</div>
        </div>
    </div>

    ${summary.coverage ? `
        <h2>Coverage Metrics</h2>
        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">${summary.coverage.statements}%</div>
                <div class="metric-label">Statements</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.coverage.branches}%</div>
                <div class="metric-label">Branches</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.coverage.functions}%</div>
                <div class="metric-label">Functions</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.coverage.lines}%</div>
                <div class="metric-label">Lines</div>
            </div>
        </div>
    ` : ''}

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
                <th>Avg Duration</th>
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
                    <td>${suite.averageDuration.toFixed(0)}ms</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
    `
  }

  private printSummary(summary: UnitExecutionSummary): void {
    console.log('\n' + '='.repeat(60))
    console.log('UNIT TEST EXECUTION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Environment: ${summary.environment}`)
    console.log(`Duration: ${(summary.duration / 1000).toFixed(2)}s`)
    console.log(`Total Tests: ${summary.totalTests}`)
    console.log(`Passed: ${summary.passed} (${summary.passRate.toFixed(1)}%)`)
    console.log(`Failed: ${summary.failed}`)
    console.log(`Skipped: ${summary.skipped}`)
    
    if (summary.coverage) {
      console.log('\nCoverage:')
      console.log(`Statements: ${summary.coverage.statements}%`)
      console.log(`Branches: ${summary.coverage.branches}%`)
      console.log(`Functions: ${summary.coverage.functions}%`)
      console.log(`Lines: ${summary.coverage.lines}%`)
    }
    
    console.log('\nPerformance:')
    console.log(`Average Duration: ${summary.performance.averageTestDuration.toFixed(0)}ms`)
    console.log(`Cache Hit Rate: ${summary.performance.cacheHitRate.toFixed(1)}%`)
    console.log(`Memory Efficiency: ${summary.performance.memoryEfficiency.toFixed(1)}%`)
    console.log(`Parallel Efficiency: ${summary.performance.parallelEfficiency.toFixed(1)}%`)
    
    if (summary.recommendations.length > 0) {
      console.log('\nRecommendations:')
      summary.recommendations.forEach(rec => console.log(`- ${rec}`))
    }
    
    console.log('\nQuality Gate: ' + (summary.qualityGate.passed ? 'PASSED' : 'FAILED'))
    if (summary.qualityGate.failures.length > 0) {
      console.log('Failures:')
      summary.qualityGate.failures.forEach(failure => console.error(`- ${failure}`))
    }
    
    console.log('='.repeat(60))
  }

  private checkQualityGates(summary: UnitExecutionSummary): void {
    if (!summary.qualityGate.passed) {
      console.error('\nUNIT TEST QUALITY GATES FAILED!')
      console.error('Failures:')
      summary.qualityGate.failures.forEach(failure => console.error(`- ${failure}`))
      
      // Exit with error code if in CI
      if (process.env.CI) {
        process.exit(1)
      }
    } else {
      console.log('\nAll unit test quality gates passed!')
    }
  }
}

export default AdvancedVitestReporter
