/**
 * Advanced Caching Strategies
 * Intelligent test result caching, dependency caching, and browser state management
 */

import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

export interface CacheEntry<T> {
  key: string
  value: T
  timestamp: number
  ttl: number
  dependencies: string[]
  metadata: Record<string, any>
}

export interface CacheConfig {
  enabled: boolean
  ttl: number // Time to live in milliseconds
  maxSize: number // Maximum cache size in MB
  storagePath: string
  compressionEnabled: boolean
  encryptionEnabled: boolean
}

export interface TestResult {
  testName: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  error?: string
  coverage?: {
    lines: number
    functions: number
    branches: number
    statements: number
  }
  screenshots?: string[]
  videos?: string[]
  metadata: Record<string, any>
}

export interface BrowserState {
  cookies: Array<{ name: string; value: string; domain: string }>
  localStorage: Record<string, string>
  sessionStorage: Record<string, string>
  viewport: { width: number; height: number }
  userAgent: string
  timestamp: number
}

class AdvancedCacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private config: CacheConfig
  private currentSize: number = 0
  private metrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    writes: 0
  }

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      enabled: true,
      ttl: 3600000, // 1 hour
      maxSize: 100, // 100 MB
      storagePath: './cache',
      compressionEnabled: true,
      encryptionEnabled: false,
      ...config
    }

    this.initializeCache()
  }

  private async initializeCache(): Promise<void> {
    if (!this.config.enabled) return

    try {
      await fs.mkdir(this.config.storagePath, { recursive: true })
      await this.loadPersistedCache()
    } catch (error) {
      console.warn('Failed to initialize cache:', error)
    }
  }

  private async loadPersistedCache(): Promise<void> {
    try {
      const cacheFile = path.join(this.config.storagePath, 'cache.json')
      const data = await fs.readFile(cacheFile, 'utf-8')
      const entries = JSON.parse(data)
      
      for (const [key, entry] of Object.entries(entries)) {
        const cacheEntry = entry as CacheEntry<any>
        
        // Check if entry is still valid
        if (Date.now() - cacheEntry.timestamp < cacheEntry.ttl) {
          this.cache.set(key, cacheEntry)
          this.currentSize += this.calculateEntrySize(cacheEntry)
        }
      }
    } catch (error) {
      // Cache file doesn't exist or is corrupted
      console.debug('No existing cache found, starting fresh')
    }
  }

  private async persistCache(): Promise<void> {
    if (!this.config.enabled) return

    try {
      const cacheFile = path.join(this.config.storagePath, 'cache.json')
      const entries = Object.fromEntries(this.cache)
      await fs.writeFile(cacheFile, JSON.stringify(entries, null, 2))
    } catch (error) {
      console.warn('Failed to persist cache:', error)
    }
  }

  private calculateEntrySize(entry: CacheEntry<any>): number {
    // Rough estimation of entry size in bytes
    const serialized = JSON.stringify(entry)
    return Buffer.byteLength(serialized, 'utf8')
  }

  private generateKey(data: any, dependencies: string[] = []): string {
    const keyData = {
      data,
      dependencies: dependencies.sort(),
      version: '1.0'
    }
    
    const hash = createHash('sha256')
    hash.update(JSON.stringify(keyData))
    return hash.digest('hex')
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private async areDependenciesChanged(entry: CacheEntry<any>): Promise<boolean> {
    for (const dependency of entry.dependencies) {
      try {
        const stats = await fs.stat(dependency)
        if (stats.mtime.getTime() > entry.timestamp) {
          return true
        }
      } catch (error) {
        // File doesn't exist or is inaccessible
        return true
      }
    }
    return false
  }

  private async evictEntries(): Promise<void> {
    const entries = Array.from(this.cache.entries())
    
    // Sort by timestamp (oldest first) and size (largest first)
    entries.sort((a, b) => {
      const timeDiff = a[1].timestamp - b[1].timestamp
      if (timeDiff !== 0) return timeDiff
      const sizeA = this.calculateEntrySize(a[1])
      const sizeB = this.calculateEntrySize(b[1])
      return sizeB - sizeA
    })

    let evictedCount = 0
    for (const [key, entry] of entries) {
      if (this.currentSize <= this.config.maxSize * 1024 * 1024) {
        break
      }

      this.cache.delete(key)
      this.currentSize -= this.calculateEntrySize(entry)
      evictedCount++
      this.metrics.evictions++
    }

    if (evictedCount > 0) {
      console.debug(`Evicted ${evictedCount} cache entries to free space`)
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.config.enabled) return null

    const entry = this.cache.get(key)
    
    if (!entry) {
      this.metrics.misses++
      return null
    }

    // Check if entry is expired
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.currentSize -= this.calculateEntrySize(entry)
      this.metrics.misses++
      return null
    }

    // Check if dependencies have changed
    if (await this.areDependenciesChanged(entry)) {
      this.cache.delete(key)
      this.currentSize -= this.calculateEntrySize(entry)
      this.metrics.misses++
      return null
    }

    this.metrics.hits++
    return entry.value
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    dependencies: string[] = [],
    metadata: Record<string, any> = {}
  ): Promise<void> {
    if (!this.config.enabled) return

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: this.config.ttl,
      dependencies,
      metadata
    }

    const entrySize = this.calculateEntrySize(entry)
    
    // Check if we need to evict entries
    if (this.currentSize + entrySize > this.config.maxSize * 1024 * 1024) {
      await this.evictEntries()
    }

    // Remove existing entry if present
    const existingEntry = this.cache.get(key)
    if (existingEntry) {
      this.currentSize -= this.calculateEntrySize(existingEntry)
    }

    this.cache.set(key, entry)
    this.currentSize += entrySize
    this.metrics.writes++

    // Persist cache periodically
    if (this.metrics.writes % 10 === 0) {
      await this.persistCache()
    }
  }

  /**
   * Delete entry from cache
   */
  async delete(key: string): Promise<void> {
    const entry = this.cache.get(key)
    if (entry) {
      this.cache.delete(key)
      this.currentSize -= this.calculateEntrySize(entry)
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear()
    this.currentSize = 0
    this.metrics = { hits: 0, misses: 0, evictions: 0, writes: 0 }
    
    try {
      const cacheFile = path.join(this.config.storagePath, 'cache.json')
      await fs.unlink(cacheFile)
    } catch (error) {
      // File doesn't exist
    }
  }

  /**
   * Cache test results
   */
  async cacheTestResult(
    testName: string,
    result: TestResult,
    dependencies: string[] = []
  ): Promise<void> {
    const key = this.generateKey({ type: 'test-result', testName }, dependencies)
    await this.set(key, result, dependencies, {
      testName,
      type: 'test-result',
      status: result.status
    })
  }

  /**
   * Get cached test result
   */
  async getCachedTestResult(testName: string): Promise<TestResult | null> {
    const key = this.generateKey({ type: 'test-result', testName })
    return this.get<TestResult>(key)
  }

  /**
   * Cache browser state
   */
  async cacheBrowserState(
    browserId: string,
    state: BrowserState,
    dependencies: string[] = []
  ): Promise<void> {
    const key = this.generateKey({ type: 'browser-state', browserId }, dependencies)
    await this.set(key, state, dependencies, {
      browserId,
      type: 'browser-state'
    })
  }

  /**
   * Get cached browser state
   */
  async getCachedBrowserState(browserId: string): Promise<BrowserState | null> {
    const key = this.generateKey({ type: 'browser-state', browserId })
    return this.get<BrowserState>(key)
  }

  /**
   * Cache test dependencies
   */
  async cacheDependencies(
    testName: string,
    dependencies: string[],
    hash: string
  ): Promise<void> {
    const key = this.generateKey({ type: 'dependencies', testName }, dependencies)
    await this.set(key, { dependencies, hash }, dependencies, {
      testName,
      type: 'dependencies'
    })
  }

  /**
   * Get cached dependencies
   */
  async getCachedDependencies(testName: string): Promise<{ dependencies: string[]; hash: string } | null> {
    const key = this.generateKey({ type: 'dependencies', testName })
    return this.get<{ dependencies: string[]; hash: string }>(key)
  }

  /**
   * Intelligent cache warming
   */
  async warmCache(testFiles: string[]): Promise<void> {
    console.log('Warming cache with test dependencies...')
    
    for (const testFile of testFiles) {
      try {
        const stats = await fs.stat(testFile)
        const dependencies = await this.findDependencies(testFile)
        const hash = await this.calculateFileHash(testFile)
        
        await this.cacheDependencies(testFile, dependencies, hash)
      } catch (error) {
        console.warn(`Failed to warm cache for ${testFile}:`, error)
      }
    }
    
    console.log(`Cache warmed with ${testFiles.length} test files`)
  }

  private async findDependencies(filePath: string): Promise<string[]> {
    const dependencies: string[] = []
    
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      
      // Simple dependency detection (can be enhanced with AST parsing)
      const importRegex = /import.*from\s+['"](.*)['"]/g
      const requireRegex = /require\s*\(['"](.*)['"]\)/g
      
      let match
      while ((match = importRegex.exec(content)) !== null) {
        const depPath = match[1]
        if (!depPath.startsWith('.')) continue // Skip external packages
        
        const resolvedPath = path.resolve(path.dirname(filePath), depPath)
        dependencies.push(resolvedPath)
      }
      
      while ((match = requireRegex.exec(content)) !== null) {
        const depPath = match[1]
        if (!depPath.startsWith('.')) continue
        
        const resolvedPath = path.resolve(path.dirname(filePath), depPath)
        dependencies.push(resolvedPath)
      }
    } catch (error) {
      console.warn(`Failed to analyze dependencies for ${filePath}:`, error)
    }
    
    return dependencies
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const hash = createHash('md5')
      hash.update(content)
      return hash.digest('hex')
    } catch (error) {
      return Date.now().toString()
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    maxSize: number
    entries: number
    hits: number
    misses: number
    hitRate: number
    evictions: number
    writes: number
  } {
    const total = this.metrics.hits + this.metrics.misses
    return {
      size: this.currentSize,
      maxSize: this.config.maxSize * 1024 * 1024,
      entries: this.cache.size,
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRate: total > 0 ? (this.metrics.hits / total) * 100 : 0,
      evictions: this.metrics.evictions,
      writes: this.metrics.writes
    }
  }

  /**
   * Optimize cache based on usage patterns
   */
  async optimize(): Promise<void> {
    console.log('Optimizing cache...')
    
    // Remove expired entries
    const expiredKeys: string[] = []
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry) || await this.areDependenciesChanged(entry)) {
        expiredKeys.push(key)
      }
    }
    
    for (const key of expiredKeys) {
      const entry = this.cache.get(key)
      if (entry) {
        this.cache.delete(key)
        this.currentSize -= this.calculateEntrySize(entry)
      }
    }
    
    // Evict entries if over size limit
    if (this.currentSize > this.config.maxSize * 1024 * 1024) {
      await this.evictEntries()
    }
    
    await this.persistCache()
    console.log(`Cache optimization complete. Removed ${expiredKeys.length} expired entries.`)
  }

  /**
   * Export cache data for analysis
   */
  exportCacheData(): {
    entries: Array<{ key: string; size: number; age: number; type: string }>
    stats: ReturnType<AdvancedCacheManager['getStats']>
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      size: this.calculateEntrySize(entry),
      age: Date.now() - entry.timestamp,
      type: entry.metadata.type || 'unknown'
    }))

    return {
      entries,
      stats: this.getStats()
    }
  }
}

// Global cache instance
export const cacheManager = new AdvancedCacheManager({
  enabled: true,
  ttl: 3600000, // 1 hour
  maxSize: 100, // 100 MB
  storagePath: './testing-infrastructure/artifacts/cache',
  compressionEnabled: true,
  encryptionEnabled: false
})

export default AdvancedCacheManager
