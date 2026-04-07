/**
 * Cache monitoring and debugging utilities
 * Provides tools for tracking cache performance, debugging cache issues,
 * and monitoring cache invalidation patterns
 */

import { cacheMonitoring } from "@/lib/cache";

// Enhanced cache monitoring with detailed tracking
export interface CacheMetrics {
  totalOperations: number;
  cacheHits: number;
  cacheMisses: number;
  invalidations: number;
  lastInvalidation: string | null;
  averageResponseTime: number;
  errorRate: number;
}

export interface CacheOperation {
  id: string;
  type: "hit" | "miss" | "invalidate" | "revalidate";
  tag?: string;
  path?: string;
  timestamp: string;
  duration?: number;
  statusCode?: number;
}

// In-memory cache metrics store (in production, use Redis or database)
class CacheMetricsStore {
  private metrics: CacheMetrics = {
    totalOperations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    invalidations: 0,
    lastInvalidation: null,
    averageResponseTime: 0,
    errorRate: 0,
  };

  private operations: CacheOperation[] = [];
  private maxOperations = 1000; // Keep last 1000 operations

  recordOperation(operation: Omit<CacheOperation, "id" | "timestamp">) {
    const fullOperation: CacheOperation = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...operation,
    };

    this.operations.push(fullOperation);
    if (this.operations.length > this.maxOperations) {
      this.operations.shift();
    }

    this.updateMetrics(fullOperation);
  }

  private updateMetrics(operation: CacheOperation) {
    this.metrics.totalOperations++;

    switch (operation.type) {
      case "hit":
        this.metrics.cacheHits++;
        break;
      case "miss":
        this.metrics.cacheMisses++;
        break;
      case "invalidate":
      case "revalidate":
        this.metrics.invalidations++;
        this.metrics.lastInvalidation = operation.timestamp;
        break;
    }

        const previousTotal = this.metrics.totalOperations - 1;
        const previousErrorCount = (this.metrics.errorRate / 100) * previousTotal;
        const isError = operation.statusCode !== undefined && operation.statusCode >= 400 ? 1 : 0;
        this.metrics.errorRate =
          this.metrics.totalOperations > 0
            ? ((previousErrorCount + isError) / this.metrics.totalOperations) * 100
            : 0;
    if (operation.duration) {
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime * (this.metrics.totalOperations - 1) + operation.duration) / 
        this.metrics.totalOperations;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  getRecentOperations(limit: number = 50): CacheOperation[] {
    return this.operations.slice(-limit);
  }

  getOperationsByTag(tag: string, limit: number = 50): CacheOperation[] {
    return this.operations
      .filter(op => op.tag === tag)
      .slice(-limit);
  }

  getOperationsByPath(path: string, limit: number = 50): CacheOperation[] {
    return this.operations
      .filter(op => op.path === path)
      .slice(-limit);
  }

  reset() {
    this.metrics = {
      totalOperations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      invalidations: 0,
      lastInvalidation: null,
      averageResponseTime: 0,
      errorRate: 0,
    };
    this.operations = [];
  }
}

// Global metrics store instance
const metricsStore = new CacheMetricsStore();

// Enhanced cache monitoring utilities
export const advancedCacheMonitoring = {
  /**
   * Records a cache operation with detailed metrics
   */
  recordOperation: (operation: Omit<CacheOperation, "id" | "timestamp">) => {
    metricsStore.recordOperation(operation);
  },

  /**
   * Gets current cache metrics
   */
  getMetrics: (): CacheMetrics => {
    return metricsStore.getMetrics();
  },

  /**
   * Gets recent cache operations
   */
  getRecentOperations: (limit?: number): CacheOperation[] => {
    return metricsStore.getRecentOperations(limit);
  },

  /**
   * Gets operations by tag
   */
  getOperationsByTag: (tag: string, limit?: number): CacheOperation[] => {
    return metricsStore.getOperationsByTag(tag, limit);
  },

  /**
   * Gets operations by path
   */
  getOperationsByPath: (path: string, limit?: number): CacheOperation[] => {
    return metricsStore.getOperationsByPath(path, limit);
  },

  /**
   * Analyzes cache performance and provides insights
   */
  analyzePerformance: () => {
    const metrics = metricsStore.getMetrics();
    const hitRate = metrics.totalOperations > 0 ? (metrics.cacheHits / metrics.totalOperations) * 100 : 0;
    const missRate = metrics.totalOperations > 0 ? (metrics.cacheMisses / metrics.totalOperations) * 100 : 0;

    return {
      hitRate: Math.round(hitRate * 100) / 100,
      missRate: Math.round(missRate * 100) / 100,
      invalidationRate: metrics.totalOperations > 0 ? (metrics.invalidations / metrics.totalOperations) * 100 : 0,
      averageResponseTime: Math.round(metrics.averageResponseTime * 100) / 100,
      totalOperations: metrics.totalOperations,
      lastInvalidation: metrics.lastInvalidation,
      recommendations: generateRecommendations(hitRate, missRate, metrics.averageResponseTime),
    };
  },

  /**
   * Resets all cache metrics
   */
  resetMetrics: () => {
    metricsStore.reset();
  },

  /**
   * Exports metrics for external monitoring systems
   */
  exportMetrics: () => {
    const metrics = metricsStore.getMetrics();
    const analysis = advancedCacheMonitoring.analyzePerformance();
    
    return {
      timestamp: new Date().toISOString(),
      metrics,
      analysis,
      recentOperations: metricsStore.getRecentOperations(10),
    };
  },
};

// Helper function to generate performance recommendations
function generateRecommendations(hitRate: number, missRate: number, avgResponseTime: number): string[] {
  const recommendations: string[] = [];

  if (hitRate < 70) {
    recommendations.push("Low cache hit rate. Consider increasing cache duration or reviewing cache key strategy.");
  }

  if (missRate > 30) {
    recommendations.push("High cache miss rate. Check for cache key conflicts or invalid cache invalidation.");
  }

  if (avgResponseTime > 100) {
    recommendations.push("High average response time. Consider optimizing cache configuration or reducing cache size.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Cache performance is optimal. No immediate action needed.");
  }

  return recommendations;
}

// Cache debugging utilities
export const cacheDebugging = {
  /**
   * Validates cache configuration
   */
  validateConfiguration: () => {
    const issues: string[] = [];

    // Check environment variables
    if (!process.env.NODE_ENV) {
      issues.push("NODE_ENV not set");
    }

    // Check cache headers
    if (process.env.NODE_ENV === "development") {
      issues.push("Running in development mode - caching behavior may differ from production");
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  },

  /**
   * Simulates cache operations for testing
   */
  simulateCacheOperations: (count: number = 100) => {
    const operations = [];
    
    for (let i = 0; i < count; i++) {
      const operation: Omit<CacheOperation, "id" | "timestamp"> = {
        type: Math.random() > 0.3 ? "hit" : "miss",
        tag: ["homepage", "about", "contact", "enrollment"][Math.floor(Math.random() * 4)],
        duration: Math.random() * 50 + 10,
      };
      
      operations.push(operation);
      advancedCacheMonitoring.recordOperation(operation);
    }

    return {
      simulated: count,
      metrics: advancedCacheMonitoring.getMetrics(),
    };
  },

  /**
   * Generates cache health report
   */
  generateHealthReport: () => {
    const metrics = metricsStore.getMetrics();
    const analysis = advancedCacheMonitoring.analyzePerformance();
    const configValidation = cacheDebugging.validateConfiguration();

    return {
      timestamp: new Date().toISOString(),
      health: analysis.hitRate > 70 ? "healthy" : analysis.hitRate > 50 ? "warning" : "critical",
      metrics,
      analysis,
      configuration: configValidation,
      recommendations: analysis.recommendations,
    };
  },
};

// Performance monitoring wrapper for cache operations
export function withCacheMonitoring<T>(
  operation: () => Promise<T>,
  context: {
    type: "hit" | "miss" | "invalidate" | "revalidate";
    tag?: string;
    path?: string;
  }
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      advancedCacheMonitoring.recordOperation({
        ...context,
        duration,
        statusCode: 200,
      });
      
      resolve(result);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      advancedCacheMonitoring.recordOperation({
        ...context,
        duration,
        statusCode: 500,
      });
      
      reject(error);
    }
  });
}
