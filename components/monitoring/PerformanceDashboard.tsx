"use client";

import { useState, useEffect } from 'react';
import { applicationMonitoring, advancedCacheMonitoring } from '@/lib/monitoring';

// Helper function to convert percentage to Tailwind width class
function getWidthClass(percentage: number): string {
  if (percentage >= 95) return 'w-full';
  if (percentage >= 90) return 'w-[90%]';
  if (percentage >= 85) return 'w-[85%]';
  if (percentage >= 80) return 'w-4/5';
  if (percentage >= 75) return 'w-3/4';
  if (percentage >= 70) return 'w-[70%]';
  if (percentage >= 65) return 'w-[65%]';
  if (percentage >= 60) return 'w-3/5';
  if (percentage >= 55) return 'w-[55%]';
  if (percentage >= 50) return 'w-1/2';
  if (percentage >= 45) return 'w-[45%]';
  if (percentage >= 40) return 'w-2/5';
  if (percentage >= 35) return 'w-[35%]';
  if (percentage >= 30) return 'w-[30%]';
  if (percentage >= 25) return 'w-1/4';
  if (percentage >= 20) return 'w-1/5';
  if (percentage >= 15) return 'w-[15%]';
  if (percentage >= 10) return 'w-[10%]';
  if (percentage >= 5) return 'w-[5%]';
  return 'w-0';
}

/**
 * Performance Dashboard Component
 * 
 * Provides a comprehensive view of application performance metrics,
 * cache performance, Web Vitals, and user journey analytics.
 */
export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Fetch performance metrics
  const fetchMetrics = async () => {
    try {
      const performanceSummary = applicationMonitoring.getPerformanceSummary();
      const cacheHealthReport = cacheDebugging.generateHealthReport();
      
      setMetrics({
        performance: performanceSummary,
        cache: cacheHealthReport,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh metrics
  useEffect(() => {
    fetchMetrics();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchMetrics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-sm text-slate-600">No performance data available</p>
          <button 
            onClick={fetchMetrics}
            className="mt-4 px-4 py-2 bg-brand text-white rounded-full text-sm hover:bg-brand-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Performance Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">
                Real-time monitoring for Riley Day Care application
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-500">Last updated</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(metrics.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                title="Refresh interval for performance metrics"
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5"
              >
                <option value={0}>Manual</option>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
              </select>
              <button
                onClick={fetchMetrics}
                className="px-4 py-2 bg-brand text-white rounded-full text-sm hover:bg-brand-dark"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Cache Hit Rate"
            value={`${metrics.performance.cache.analysis.hitRate}%`}
            status={metrics.performance.cache.analysis.hitRate > 70 ? 'good' : 'warning'}
            description="Cache efficiency"
          />
          <MetricCard
            title="Avg Response Time"
            value={`${metrics.performance.cache.metrics.averageResponseTime.toFixed(2)}ms`}
            status={metrics.performance.cache.metrics.averageResponseTime < 100 ? 'good' : 'warning'}
            description="Average response time"
          />
          <MetricCard
            title="Total Operations"
            value={metrics.performance.cache.metrics.totalOperations.toLocaleString()}
            status="neutral"
            description="Total cache operations"
          />
          <MetricCard
            title="Error Rate"
            value={`${metrics.performance.cache.metrics.errorRate.toFixed(2)}%`}
            status={metrics.performance.cache.metrics.errorRate < 5 ? 'good' : 'critical'}
            description="Error rate percentage"
          />
        </div>

        {/* Cache Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Cache Performance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CacheMetricsChart metrics={metrics.performance.cache} />
            <CacheOperationsList operations={advancedCacheMonitoring.getRecentOperations(10)} />
          </div>
        </div>

        {/* Health Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">System Health</h2>
          <HealthStatus health={metrics.cache} />
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Performance Recommendations</h2>
          <RecommendationsList 
            recommendations={metrics.performance.cache.analysis.recommendations} 
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({ 
  title, 
  value, 
  status, 
  description 
}: {
  title: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical' | 'neutral';
  description: string;
}) {
  const statusColors = {
    good: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
    neutral: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-500 mt-2">{description}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
          {status.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

/**
 * Cache Metrics Chart Component
 */
function CacheMetricsChart({ metrics }: { metrics: any }) {
  const hitRate = metrics.analysis.hitRate;
  const missRate = metrics.analysis.missRate;
  
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-900 mb-4">Cache Performance</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Hit Rate</span>
            <span className="font-medium text-slate-900">{hitRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 relative overflow-hidden">
            <div className="h-2 rounded-full transition-all duration-300 absolute top-0 left-0 bg-green-500" style={{ width: `${hitRate}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Miss Rate</span>
            <span className="font-medium text-slate-900">{missRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 relative overflow-hidden">
            <div className={`h-2 rounded-full transition-all duration-300 absolute top-0 left-0 bg-red-500 ${getWidthClass(missRate)}`}></div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Total Operations</p>
              <p className="font-medium text-slate-900">{metrics.metrics.totalOperations.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-600">Avg Response Time</p>
              <p className="font-medium text-slate-900">{metrics.metrics.averageResponseTime.toFixed(2)}ms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Cache Operations List Component
 */
function CacheOperationsList({ operations }: { operations: any[] }) {
  if (!operations || operations.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium text-slate-900 mb-4">Recent Operations</h3>
        <p className="text-sm text-slate-500">No recent operations</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-900 mb-4">Recent Operations</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {operations.map((op, index) => (
          <div key={op.id || index} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                op.type === 'hit' ? 'bg-green-500' : 
                op.type === 'miss' ? 'bg-red-500' : 
                'bg-yellow-500'
              }`}></div>
              <span className="font-medium text-slate-900">{op.type.toUpperCase()}</span>
              {op.tag && <span className="text-slate-600">({op.tag})</span>}
            </div>
            <div className="text-right">
              {op.duration && <span className="text-slate-600">{op.duration}ms</span>}
              <div className="text-xs text-slate-500">
                {new Date(op.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Health Status Component
 */
function HealthStatus({ health }: { health: any }) {
  const healthStatus = health.health;
  const statusColors = {
    healthy: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[healthStatus]}`}>
          {healthStatus.toUpperCase()}
        </div>
        <span className="text-sm text-slate-600">
          Overall system health status
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-slate-900">Configuration</p>
          <p className="text-xs text-slate-600 mt-1">
            {health.configuration.isValid ? 'Valid' : 'Issues detected'}
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-slate-900">Cache Hit Rate</p>
          <p className="text-xs text-slate-600 mt-1">
            {health.analysis.hitRate.toFixed(1)}%
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-slate-900">Response Time</p>
          <p className="text-xs text-slate-600 mt-1">
            {health.metrics.averageResponseTime.toFixed(2)}ms
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Recommendations List Component
 */
function RecommendationsList({ recommendations }: { recommendations: string[] }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        No recommendations at this time. Performance is optimal.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {recommendations.map((recommendation, index) => (
        <li key={index} className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-brand mt-2 flex-shrink-0"></div>
          <p className="text-sm text-slate-700">{recommendation}</p>
        </li>
      ))}
    </ul>
  );
}

// Import cache debugging utilities
const cacheDebugging = {
  generateHealthReport: () => {
    const metrics = advancedCacheMonitoring.getMetrics();
    const analysis = advancedCacheMonitoring.analyzePerformance();
    
    return {
      timestamp: new Date().toISOString(),
      health: analysis.hitRate > 70 ? "healthy" : analysis.hitRate > 50 ? "warning" : "critical",
      metrics,
      analysis,
      configuration: {
        isValid: !!process.env.NODE_ENV && process.env.NODE_ENV !== 'development',
      },
      recommendations: analysis.recommendations,
    };
  },
};
