/**
 * Comprehensive monitoring and debugging utilities
 * Provides tools for tracking cache performance, application metrics,
 * error tracking, and performance monitoring with Sentry integration
 */

import { cacheMonitoring } from "@/lib/cache";
import * as Sentry from "@sentry/nextjs";

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

// Application performance metrics
export interface ApplicationMetrics {
  pageViews: number;
  apiRequests: number;
  errorCount: number;
  averageResponseTime: number;
  uniqueUsers: number;
  bounceRate: number;
  conversionRate: number;
}

// User journey tracking
export interface UserJourneyEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType: 'page_view' | 'form_start' | 'form_submit' | 'cta_click' | 'error' | 'conversion';
  eventName: string;
  path: string;
  timestamp: string;
  duration?: number;
  properties?: Record<string, any>;
}

// Performance monitoring interfaces
export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  timestamp: string;
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

// Comprehensive application monitoring with Sentry integration
export const applicationMonitoring = {
  /**
   * Track user journey events with Sentry
   */
  trackUserJourney: (event: Omit<UserJourneyEvent, "id" | "timestamp">) => {
    const fullEvent: UserJourneyEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...event,
    };

    // Send to Sentry as breadcrumb
    Sentry.addBreadcrumb({
      message: event.eventName,
      category: 'user_journey',
      level: 'info',
      data: {
        eventType: event.eventType,
        path: event.path,
        sessionId: event.sessionId,
        properties: event.properties,
      },
    });

    // Track as custom metric
    Sentry.metrics.increment('user_journey.event', 1, {
      event_type: event.eventType,
      event_name: event.eventName,
      path: event.path,
    });

    return fullEvent;
  },

  /**
   * Track form interactions
   */
  trackFormInteraction: (formName: string, action: 'start' | 'submit' | 'error', properties?: Record<string, any>) => {
    return applicationMonitoring.trackUserJourney({
      sessionId: getSessionId(),
      eventType: action === 'start' ? 'form_start' : action === 'submit' ? 'form_submit' : 'error',
      eventName: `form_${action}_${formName}`,
      path: window.location.pathname,
      properties: {
        formName,
        ...properties,
      },
    });
  },

  /**
   * Track CTA clicks
   */
  trackCTAClick: (ctaName: string, destination?: string) => {
    return applicationMonitoring.trackUserJourney({
      sessionId: getSessionId(),
      eventType: 'cta_click',
      eventName: `cta_click_${ctaName}`,
      path: window.location.pathname,
      properties: {
        ctaName,
        destination,
      },
    });
  },

  /**
   * Track conversions
   */
  trackConversion: (conversionType: string, value?: number) => {
    return applicationMonitoring.trackUserJourney({
      sessionId: getSessionId(),
      eventType: 'conversion',
      eventName: `conversion_${conversionType}`,
      path: window.location.pathname,
      properties: {
        conversionType,
        value,
      },
    });
  },

  /**
   * Track API performance
   */
  trackAPIPerformance: (endpoint: string, duration: number, statusCode: number) => {
    Sentry.metrics.timing('api.request_duration', duration, {
      endpoint,
      status_code: statusCode.toString(),
    });

    if (statusCode >= 400) {
      Sentry.metrics.increment('api.error_count', 1, {
        endpoint,
        status_code: statusCode.toString(),
      });
    }
  },

  /**
   * Get application performance summary
   */
  getPerformanceSummary: () => {
    const cacheMetrics = advancedCacheMonitoring.getMetrics();
    const cacheAnalysis = advancedCacheMonitoring.analyzePerformance();
    
    return {
      cache: {
        metrics: cacheMetrics,
        analysis: cacheAnalysis,
      },
      timestamp: new Date().toISOString(),
    };
  },
};

// Core Web Vitals monitoring utilities
export const webVitalsMonitoring = {
  /**
   * Process Web Vitals metrics and send to Sentry
   */
  trackWebVital: (metric: PerformanceMetric) => {
    const rating = metric.rating;
    
    // Send to Sentry as performance metric
    Sentry.metrics.gauge(`web_vitals.${metric.name.toLowerCase()}`, metric.value, {
      rating,
      navigation_type: metric.navigationType,
    });

    // Add breadcrumb for poor performance
    if (rating === 'poor') {
      Sentry.addBreadcrumb({
        message: `Poor Web Vital: ${metric.name}`,
        category: 'performance',
        level: 'warning',
        data: {
          metric: metric.name,
          value: metric.value,
          rating,
          threshold: getThreshold(metric.name),
        },
      });
    }

    // Track performance issues
    if (rating === 'poor' || rating === 'needs-improvement') {
      Sentry.captureMessage(
        `Performance Issue: ${metric.name} is ${rating} (${metric.value})`,
        'warning'
      );
    }
  },

  /**
   * Get Web Vitals thresholds
   */
  getThreshold: (metricName: string): number => {
    const thresholds: Record<string, number> = {
      'LCP': 2500, // Largest Contentful Paint
      'FID': 100,  // First Input Delay
      'CLS': 0.1,  // Cumulative Layout Shift
      'FCP': 1800, // First Contentful Paint
      'TTFB': 800, // Time to First Byte
      'INP': 200,  // Interaction to Next Paint
    };
    return thresholds[metricName] || 0;
  },
};

// Error monitoring utilities
export const errorMonitoring = {
  /**
   * Categorize and report errors with context
   */
  reportError: (error: Error, context?: Record<string, any>) => {
    const errorCategory = categorizeError(error);
    
    Sentry.captureException(error, {
      tags: {
        error_category: errorCategory,
      },
      extra: {
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    });

    // Track error metrics
    Sentry.metrics.increment('errors.count', 1, {
      category: errorCategory,
      error_type: error.name,
    });

    return errorCategory;
  },

  /**
   * Report API errors with request context
   */
  reportAPIError: (error: Error, endpoint: string, statusCode?: number, requestBody?: any) => {
    return errorMonitoring.reportError(error, {
      type: 'api_error',
      endpoint,
      statusCode,
      requestBody: requestBody ? JSON.stringify(requestBody) : undefined,
    });
  },
};

// Helper functions
function getSessionId(): string {
  // Get or create session ID from sessionStorage or generate new one
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('monitoring_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('monitoring_session_id', sessionId);
    }
    return sessionId;
  }
  return 'server_session';
}

function categorizeError(error: Error): string {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'network';
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }
  if (message.includes('permission') || message.includes('unauthorized')) {
    return 'permission';
  }
  if (message.includes('timeout')) {
    return 'timeout';
  }
  if (error.name === 'TypeError') {
    return 'type_error';
  }
  if (error.name === 'ReferenceError') {
    return 'reference_error';
  }
  
  return 'unknown';
}

function getThreshold(metricName: string): number {
  return webVitalsMonitoring.getThreshold(metricName);
}
