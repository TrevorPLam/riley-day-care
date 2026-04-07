/**
 * Performance monitoring utilities for Web Vitals reporting
 * Integrates with Plausible Analytics for production tracking
 * Provides development console logging for debugging
 */

import { trackEvent, ANALYTICS_EVENTS } from './analytics';

// Web Vitals thresholds based on Google's recommendations
export const WEB_VITAL_THRESHOLDS = {
  LCP: 2500,  // Largest Contentful Paint (ms)
  FID: 100,   // First Input Delay (ms)
  CLS: 0.1,   // Cumulative Layout Shift
  FCP: 1800,  // First Contentful Paint (ms)
  TTFB: 800,  // Time to First Byte (ms)
  INP: 200,   // Interaction to Next Paint (ms)
} as const;

export interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType?: string;
}

/**
 * Gets the threshold value for a given Web Vitals metric
 */
export function getThreshold(metricName: string): number {
  return WEB_VITAL_THRESHOLDS[metricName as keyof typeof WEB_VITAL_THRESHOLDS] || 0;
}

/**
 * Reports Web Vitals to analytics and console
 * 
 * In development: logs detailed metrics to console
 * In production: sends to Plausible Analytics
 */
export function reportWebVitals(metric: WebVitalMetric) {
  // Log detailed metrics in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.group(`[Web Vitals] ${metric.name}`);
    console.log('Value:', metric.value);
    console.log('Rating:', metric.rating);
    console.log('Delta:', metric.delta);
    console.log('Navigation Type:', metric.navigationType || 'unknown');
    console.log('Threshold:', getThreshold(metric.name));
    
    // Add warnings for poor performance
    if (metric.rating === 'poor') {
      console.warn(`Performance Issue: ${metric.name} is poor (${metric.value} > ${getThreshold(metric.name)})`);
    } else if (metric.rating === 'needs-improvement') {
      console.warn(`Performance Warning: ${metric.name} needs improvement (${metric.value} > ${getThreshold(metric.name)})`);
    } else {
      console.log(`Performance Good: ${metric.name} is within threshold`);
    }
    
    console.groupEnd();
  }

  // Send to Plausible Analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Track overall Web Vitals event
    trackEvent(ANALYTICS_EVENTS.WEB_VITALS, {
      metric_name: metric.name,
      metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value), // CLS needs scaling
      metric_rating: metric.rating,
      metric_delta: Math.round(metric.delta),
      metric_id: metric.id,
      navigation_type: metric.navigationType || 'unknown',
    });

    // Track specific performance issues
    if (metric.rating === 'poor') {
      trackEvent(ANALYTICS_EVENTS.PERFORMANCE_ISSUE, {
        metric_name: metric.name,
        metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        threshold: getThreshold(metric.name),
        severity: 'poor',
      });
    } else if (metric.rating === 'needs-improvement') {
      trackEvent(ANALYTICS_EVENTS.PERFORMANCE_WARNING, {
        metric_name: metric.name,
        metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        threshold: getThreshold(metric.name),
        severity: 'needs-improvement',
      });
    }
  }
}

/**
 * Performance budget thresholds for different page types
 */
export const PERFORMANCE_BUDGETS = {
  homepage: {
    LCP: 2000,  // Stricter for homepage
    FID: 100,
    CLS: 0.1,
    FCP: 1500,
    TTFB: 600,
  },
  enrollment: {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    FCP: 1800,
    TTFB: 800,
  },
  content: {
    LCP: 3000,  // More lenient for content pages
    FID: 100,
    CLS: 0.25,
    FCP: 2000,
    TTFB: 1000,
  },
} as const;

/**
 * Gets performance budget for current page
 */
export function getPerformanceBudget(pathname: string = '/'): typeof PERFORMANCE_BUDGETS.homepage {
  if (pathname === '/') return PERFORMANCE_BUDGETS.homepage;
  if (pathname.includes('/enrollment')) return PERFORMANCE_BUDGETS.enrollment;
  return PERFORMANCE_BUDGETS.content;
}

/**
 * Validates metrics against performance budget
 */
export function validatePerformanceBudget(metric: WebVitalMetric, pathname: string = '/') {
  const budget = getPerformanceBudget(pathname);
  const threshold = budget[metric.name as keyof typeof budget] || getThreshold(metric.name);
  
  return {
    withinBudget: metric.value <= threshold,
    budget: threshold,
    actual: metric.value,
    variance: metric.value - threshold,
  };
}

/**
 * Custom hook for enhanced Web Vitals monitoring
 * Can be used in components that need performance data
 */
export function usePerformanceMonitoring() {
  return {
    reportWebVitals,
    getThreshold,
    validatePerformanceBudget,
    getPerformanceBudget,
  };
}
