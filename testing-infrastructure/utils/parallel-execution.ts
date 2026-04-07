/**
 * Intelligent Parallel Execution System
 * AI-powered test distribution and resource-aware scheduling
 */

import { configManager } from '../config/test-config'

export interface TestMetrics {
  name: string
  duration: number // Average execution time in ms
  complexity: 'low' | 'medium' | 'high'
  dependencies: string[] // Files this test depends on
  browserRequirements: string[]
  memoryUsage: number // Estimated memory usage in MB
  cpuUsage: number // Estimated CPU usage percentage
  flakiness: number // Historical flakiness score (0-100)
  priority: number // Test priority (1-10)
  tags: string[]
}

export interface WorkerCapability {
  id: string
  browser: string
  platform: string
  availableMemory: number // MB
  availableCpu: number // cores
  maxConcurrency: number
  currentLoad: number
  supportedFeatures: string[]
}

export interface ExecutionPlan {
  workers: WorkerCapability[]
  assignments: Map<string, string[]> // workerId -> testNames
  estimatedDuration: number
  resourceUtilization: number
  riskScore: number
}

export interface TestShard {
  id: string
  tests: string[]
  estimatedDuration: number
  resourceRequirements: {
    memory: number
    cpu: number
  }
  browserRequirements: string[]
  priority: number
}

class ParallelExecutionOptimizer {
  private testMetrics: Map<string, TestMetrics> = new Map()
  private workerCapabilities: WorkerCapability[] = []
  private historicalData: Map<string, number[]> = new Map() // test -> execution times
  private historicalOutcomes: Map<string, boolean[]> = new Map()

  constructor() {
    this.initializeWorkerCapabilities()
  }

  private initializeWorkerCapabilities(): void {
    const config = configManager.getConfig()
    const browsers = configManager.getBrowsers()

    this.workerCapabilities = browsers.map((browser, index) => ({
      id: `worker-${browser.name}-${index}`,
      browser: browser.name,
      platform: browser.viewport.width > 768 ? 'desktop' : 'mobile',
      availableMemory: 2048, // 2GB per worker
      availableCpu: 2,
      maxConcurrency: config.environment.parallel,
      currentLoad: 0,
      supportedFeatures: this.getBrowserFeatures(browser.name)
    }))
  }

  private getBrowserFeatures(browserName: string): string[] {
    const features = ['basic-interactions', 'screenshots', 'network-monitoring']
    
    if (browserName === 'chromium') {
      features.push('tracing', 'video-recording', 'console-logging', 'device-emulation')
    } else if (browserName === 'firefox') {
      features.push('tracing', 'console-logging')
    } else if (browserName === 'webkit') {
      features.push('tracing', 'video-recording', 'console-logging')
    }

    return features
  }

  /**
   * Record test execution metrics for learning
   */
  recordTestExecution(testName: string, duration: number, success: boolean): void {
    if (!this.historicalData.has(testName)) {
      this.historicalData.set(testName, [])
    }
    if (!this.historicalOutcomes.has(testName)) {
      this.historicalOutcomes.set(testName, [])
    }
    
    const executions = this.historicalData.get(testName)!
    executions.push(duration)
    const outcomes = this.historicalOutcomes.get(testName)!
    outcomes.push(success)
    
    if (executions.length > 10) {
      executions.shift()
    }
    if (outcomes.length > 10) {
      outcomes.shift()
    }

    this.updateTestMetrics(testName, duration, success)
  }

  private updateTestMetrics(testName: string, duration: number, success: boolean): void {
    const executions = this.historicalData.get(testName) || []
    const outcomes = this.historicalOutcomes.get(testName) || []
    
    const avgDuration = executions.reduce((sum, time) => sum + time, 0) / executions.length
    const complexity = this.inferComplexity(avgDuration)
    const flakiness = this.calculateFlakiness(outcomes)
    
    const metrics: TestMetrics = {
      name: testName,
      duration: avgDuration,
      complexity,
      dependencies: this.inferDependencies(testName),
      browserRequirements: this.inferBrowserRequirements(testName),
      memoryUsage: this.estimateMemoryUsage(avgDuration, complexity),
      cpuUsage: this.estimateCpuUsage(avgDuration, complexity),
      flakiness,
      priority: this.calculatePriority(testName),
      tags: this.extractTags(testName)
    }

    this.testMetrics.set(testName, metrics)
  }

  private inferComplexity(duration: number): 'low' | 'medium' | 'high' {
    if (duration < 5000) return 'low'
    if (duration < 15000) return 'medium'
    return 'high'
  }

  private calculateFlakiness(outcomes: boolean[]): number {
    if (outcomes.length < 3) return 10

    const failures = outcomes.filter((outcome) => !outcome).length
    const failureRate = failures / outcomes.length
    return Math.round(failureRate * 100)
  }

  private inferDependencies(testName: string): string[] {
    // Simple heuristic based on test name patterns
    const dependencies: string[] = []
    
    if (testName.includes('enrollment')) {
      dependencies.push('auth', 'form-validation', 'email-service')
    }
    if (testName.includes('navigation')) {
      dependencies.push('routing', 'components')
    }
    
    return dependencies
  }

  private inferBrowserRequirements(testName: string): string[] {
    const requirements = ['chromium'] // Default
    
    if (testName.includes('mobile') || testName.includes('responsive')) {
      requirements.push('Mobile Chrome', 'Mobile Safari')
    }
    if (testName.includes('accessibility')) {
      requirements.push('chromium', 'firefox', 'webkit')
    }
    
    return requirements
  }

  private estimateMemoryUsage(duration: number, complexity: 'low' | 'medium' | 'high'): number {
    const baseMemory = 256 // MB
    const complexityMultiplier = { low: 1, medium: 1.5, high: 2 }[complexity]
    const durationFactor = Math.min(duration / 10000, 2) // Scale with duration but cap at 2x
    
    return Math.round(baseMemory * complexityMultiplier * durationFactor)
  }

  private estimateCpuUsage(duration: number, complexity: 'low' | 'medium' | 'high'): number {
    const baseCpu = 25 // percentage
    const complexityMultiplier = { low: 1, medium: 1.5, high: 2 }[complexity]
    
    return Math.min(baseCpu * complexityMultiplier, 100)
  }

  private calculatePriority(testName: string): number {
    let priority = 5 // Default priority
    
    // Higher priority for critical paths
    if (testName.includes('enrollment')) priority += 3
    if (testName.includes('navigation')) priority += 2
    if (testName.includes('api')) priority += 2
    
    // Lower priority for supplementary tests
    if (testName.includes('visual')) priority -= 1
    if (testName.includes('accessibility')) priority -= 1
    
    return Math.max(1, Math.min(10, priority))
  }

  private extractTags(testName: string): string[] {
    const tags: string[] = []
    
    if (testName.includes('e2e')) tags.push('e2e')
    if (testName.includes('unit')) tags.push('unit')
    if (testName.includes('integration')) tags.push('integration')
    if (testName.includes('performance')) tags.push('performance')
    if (testName.includes('security')) tags.push('security')
    if (testName.includes('accessibility')) tags.push('accessibility')
    
    return tags
  }

  /**
   * Create optimal execution plan for given tests
   */
  createExecutionPlan(testNames: string[]): ExecutionPlan {
    const testList = testNames.map(name => this.testMetrics.get(name) || {
      name,
      duration: 5000,
      complexity: 'medium' as const,
      dependencies: [],
      browserRequirements: ['chromium'],
      memoryUsage: 256,
      cpuUsage: 25,
      flakiness: 10,
      priority: 5,
      tags: []
    })

    // Sort by priority and risk (high priority, low flakiness first)
    testList.sort((a, b) => {
      const scoreA = a.priority - (a.flakiness / 10)
      const scoreB = b.priority - (b.flakiness / 10)
      return scoreB - scoreA
    })

    // Create test shards
    const shards = this.createTestShards(testList)
    
    // Assign shards to workers
    const assignments = this.assignShardsToWorkers(shards)
    
    // Calculate metrics
    const estimatedDuration = this.calculateEstimatedDuration(assignments)
    const resourceUtilization = this.calculateResourceUtilization(assignments)
    const riskScore = this.calculateRiskScore(assignments)

    return {
      workers: this.workerCapabilities,
      assignments,
      estimatedDuration,
      resourceUtilization,
      riskScore
    }
  }

  private createTestShards(tests: TestMetrics[]): TestShard[] {
    const shards: TestShard[] = []
    const maxShardDuration = 30000 // 30 seconds per shard
    const maxShardMemory = 1024 // 1GB per shard

    let currentShard: TestShard = {
      id: 'shard-0',
      tests: [],
      estimatedDuration: 0,
      resourceRequirements: { memory: 0, cpu: 0 },
      browserRequirements: [],
      priority: 0
    }

    for (const test of tests) {
      // Check if adding this test would exceed limits
      const wouldExceedDuration = currentShard.estimatedDuration + test.duration > maxShardDuration
      const wouldExceedMemory = currentShard.resourceRequirements.memory + test.memoryUsage > maxShardMemory
      const hasConflictingBrowsers = !this.canCombineBrowsers(currentShard.browserRequirements, test.browserRequirements)

      if (wouldExceedDuration || wouldExceedMemory || hasConflictingBrowsers) {
        // Finalize current shard and start new one
        if (currentShard.tests.length > 0) {
          shards.push(currentShard)
        }
        
        currentShard = {
          id: `shard-${shards.length}`,
          tests: [],
          estimatedDuration: 0,
          resourceRequirements: { memory: 0, cpu: 0 },
          browserRequirements: [],
          priority: 0
        }
      }

      // Add test to current shard
      currentShard.tests.push(test.name)
      currentShard.estimatedDuration += test.duration
      currentShard.resourceRequirements.memory += test.memoryUsage
      currentShard.resourceRequirements.cpu += test.cpuUsage
      currentShard.browserRequirements = [...new Set([...currentShard.browserRequirements, ...test.browserRequirements])]
      currentShard.priority = Math.max(currentShard.priority, test.priority)
    }

    // Add final shard
    if (currentShard.tests.length > 0) {
      shards.push(currentShard)
    }

    return shards
  }

  private canCombineBrowsers(existing: string[], newBrowsers: string[]): boolean {
    // Can combine if no conflicting requirements
    const conflicting = existing.filter(browser => !newBrowsers.includes(browser))
    return conflicting.length === 0 || existing.length === 0
  }

  private assignShardsToWorkers(shards: TestShard[]): Map<string, string[]> {
    const assignments = new Map<string, string[]>()
    
    // Initialize assignments
    this.workerCapabilities.forEach(worker => {
      assignments.set(worker.id, [])
    })

    // Sort shards by priority
    shards.sort((a, b) => b.priority - a.priority)

    // Assign shards to workers based on capability and load
    for (const shard of shards) {
      const bestWorker = this.findBestWorkerForShard(shard)
      if (bestWorker) {
        const currentAssignments = assignments.get(bestWorker.id) || []
        currentAssignments.push(...shard.tests)
        assignments.set(bestWorker.id, currentAssignments)
        bestWorker.currentLoad += 1
      }
    }

    return assignments
  }

  private findBestWorkerForShard(shard: TestShard): WorkerCapability | null {
    // Find workers that can handle the shard's requirements
    const capableWorkers = this.workerCapabilities.filter(worker => {
      const hasRequiredBrowser = shard.browserRequirements.includes(worker.browser)
      const hasEnoughMemory = worker.availableMemory >= shard.resourceRequirements.memory
      const hasEnoughCpu = worker.availableCpu >= shard.resourceRequirements.cpu / 2
      const isNotOverloaded = worker.currentLoad < worker.maxConcurrency
      
      return hasRequiredBrowser && hasEnoughMemory && hasEnoughCpu && isNotOverloaded
    })

    if (capableWorkers.length === 0) return null

    // Sort by current load (prefer less loaded workers)
    capableWorkers.sort((a, b) => a.currentLoad - b.currentLoad)

    return capableWorkers[0]
  }

  private calculateEstimatedDuration(assignments: Map<string, string[]>): number {
    let maxDuration = 0
    
    for (const [workerId, testNames] of assignments) {
      const workerDuration = testNames.reduce((total, testName) => {
        const metrics = this.testMetrics.get(testName)
        return total + (metrics?.duration || 5000)
      }, 0)
      
      maxDuration = Math.max(maxDuration, workerDuration)
    }

    return maxDuration
  }

  private calculateResourceUtilization(assignments: Map<string, string[]>): number {
    let totalUtilization = 0
    let workerCount = 0

    for (const [workerId, testNames] of assignments) {
      const worker = this.workerCapabilities.find(w => w.id === workerId)
      if (!worker) continue

      const memoryUsage = testNames.reduce((total, testName) => {
        const metrics = this.testMetrics.get(testName)
        return total + (metrics?.memoryUsage || 256)
      }, 0)

      const utilization = (memoryUsage / worker.availableMemory) * 100
      totalUtilization += utilization
      workerCount++
    }

    return workerCount > 0 ? totalUtilization / workerCount : 0
  }

  private calculateRiskScore(assignments: Map<string, string[]>): number {
    let totalRisk = 0
    let testCount = 0

    for (const [, testNames] of assignments) {
      for (const testName of testNames) {
        const metrics = this.testMetrics.get(testName)
        if (metrics) {
          // Risk based on flakiness and complexity
          const testRisk = (metrics.flakiness / 100) * (metrics.complexity === 'high' ? 2 : metrics.complexity === 'medium' ? 1.5 : 1)
          totalRisk += testRisk
          testCount++
        }
      }
    }

    return testCount > 0 ? (totalRisk / testCount) * 100 : 0
  }

  /**
   * Get recommendations for improving parallel execution
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = []
    
    // Analyze worker utilization
    const avgLoad = this.workerCapabilities.reduce((sum, worker) => sum + worker.currentLoad, 0) / this.workerCapabilities.length
    
    if (avgLoad < 0.5) {
      recommendations.push('Consider reducing parallel workers to optimize resource usage')
    } else if (avgLoad > 0.9) {
      recommendations.push('Consider increasing parallel workers or adding more resources')
    }

    // Analyze test distribution
    const highFlakinessTests = Array.from(this.testMetrics.values())
      .filter(test => test.flakiness > 20)
      .map(test => test.name)

    if (highFlakinessTests.length > 0) {
      recommendations.push(`Focus on stabilizing flaky tests: ${highFlakinessTests.join(', ')}`)
    }

    // Analyze test complexity
    const highComplexityTests = Array.from(this.testMetrics.values())
      .filter(test => test.complexity === 'high')
      .map(test => test.name)

    if (highComplexityTests.length > 0) {
      recommendations.push(`Consider breaking down complex tests: ${highComplexityTests.join(', ')}`)
    }

    return recommendations
  }

  /**
   * Get execution statistics
   */
  getExecutionStats(): {
    totalTests: number
    avgDuration: number
    avgFlakiness: number
    resourceUtilization: number
    workerEfficiency: number
  } {
    const tests = Array.from(this.testMetrics.values())
    
    return {
      totalTests: tests.length,
      avgDuration: tests.reduce((sum, test) => sum + test.duration, 0) / tests.length || 0,
      avgFlakiness: tests.reduce((sum, test) => sum + test.flakiness, 0) / tests.length || 0,
      resourceUtilization: this.calculateResourceUtilization(new Map()),
      workerEfficiency: this.workerCapabilities.reduce((sum, worker) => sum + (worker.currentLoad / worker.maxConcurrency), 0) / this.workerCapabilities.length || 0
    }
  }
}

export const parallelOptimizer = new ParallelExecutionOptimizer()
export default ParallelExecutionOptimizer
