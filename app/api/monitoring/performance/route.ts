import { NextRequest, NextResponse } from 'next/server';
import { applicationMonitoring, advancedCacheMonitoring, cacheDebugging } from '@/lib/monitoring';
import * as Sentry from '@sentry/nextjs';

/**
 * API endpoint for performance monitoring data
 * 
 * GET /api/monitoring/performance
 * Returns comprehensive performance metrics for the dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Get performance summary
    const performanceSummary = applicationMonitoring.getPerformanceSummary();
    
    // Get cache health report
    const cacheHealthReport = cacheDebugging.generateHealthReport();
    
    // Get recent cache operations
    const recentOperations = advancedCacheMonitoring.getRecentOperations(20);
    
    // Get Web Vitals data (if available)
    const webVitals = getWebVitalsSummary();
    
    // Get error metrics
    const errorMetrics = getErrorMetrics();
    
    const response = {
      timestamp: new Date().toISOString(),
      performance: performanceSummary,
      cache: cacheHealthReport,
      operations: recentOperations,
      webVitals,
      errors: errorMetrics,
    };

    // Track API performance (removed due to TypeScript compatibility issues)
    // Note: Metrics tracking can be re-enabled once Sentry API is updated

    return NextResponse.json(response);
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/monitoring/performance',
      },
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch performance metrics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * API endpoint for clearing monitoring data
 * 
 * DELETE /api/monitoring/performance
 * Clears all monitoring data (use with caution)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Clear cache metrics
    advancedCacheMonitoring.resetMetrics();
    
    // Track the clear operation
    Sentry.addBreadcrumb({
      message: 'Performance monitoring data cleared',
      category: 'monitoring',
      level: 'info',
    });

    return NextResponse.json({
      message: 'Performance monitoring data cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/monitoring/performance',
        action: 'clear',
      },
    });

    return NextResponse.json(
      { 
        error: 'Failed to clear performance metrics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Helper functions for gathering metrics
 */

function getWebVitalsSummary() {
  // This would typically come from a database or monitoring service
  // For now, return placeholder data
  return {
    lcp: { average: 0, status: 'good' },
    fid: { average: 0, status: 'good' },
    cls: { average: 0, status: 'good' },
    fcp: { average: 0, status: 'good' },
    ttfb: { average: 0, status: 'good' },
  };
}

function getErrorMetrics() {
  // This would typically come from Sentry or error tracking service
  // For now, return placeholder data
  return {
    totalErrors: 0,
    errorRate: 0,
    categories: {
      network: 0,
      validation: 0,
      permission: 0,
      timeout: 0,
      type_error: 0,
      reference_error: 0,
      unknown: 0,
    },
  };
}

function getSystemMetrics() {
  const memUsage = process.memoryUsage();
  
  return {
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
    },
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
  };
}
