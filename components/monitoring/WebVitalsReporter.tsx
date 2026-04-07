"use client";

import { useReportWebVitals } from 'next/web-vitals';
import * as Sentry from '@sentry/nextjs';

const WEB_VITAL_THRESHOLDS: Record<string, number> = {
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
  FCP: 1800,
  TTFB: 800,
  INP: 200,
};

function getThreshold(metricName: string): number {
  return WEB_VITAL_THRESHOLDS[metricName] ?? 0;
}

function trackWebVital(metric: {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType?: string;
}) {
  Sentry.metrics.gauge(`web_vitals.${metric.name.toLowerCase()}`, metric.value, {
    rating: metric.rating,
    navigation_type: metric.navigationType ?? 'unknown',
  });

  if (metric.rating === 'poor') {
    Sentry.addBreadcrumb({
      message: `Poor Web Vital: ${metric.name}`,
      category: 'performance',
      level: 'warning',
      data: {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        threshold: getThreshold(metric.name),
      },
    });
  }

  if (metric.rating === 'poor' || metric.rating === 'needs-improvement') {
    Sentry.captureMessage(
      `Performance Issue: ${metric.name} is ${metric.rating} (${metric.value})`,
      'warning'
    );
  }
}

/**
 * WebVitalsReporter Component
 * 
 * This component automatically tracks Core Web Vitals and reports them
 * to Sentry with enhanced context and categorization.
 * 
 * Place this component in your app layout or root component to enable
 * automatic Web Vitals monitoring.
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Transform the metric to our PerformanceMetric interface
    const performanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      timestamp: new Date().toISOString(),
    };

    // Send to our monitoring system
    trackWebVital(performanceMetric);

    // Optional: Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.group(`Web Vitals: ${metric.name}`);
      console.log('Value:', metric.value);
      console.log('Rating:', metric.rating);
      console.log('Delta:', metric.delta);
      console.log('Navigation Type:', metric.navigationType);
      console.log('Threshold:', getThreshold(metric.name));
      console.groupEnd();
    }
  });

  // This component doesn't render anything
  return null;
}

/**
 * Hook for custom Web Vitals tracking
 * 
 * Use this hook if you need more control over Web Vitals reporting
 * or want to add custom logic alongside the standard reporting.
 */
export function useWebVitalsMonitoring() {
  useReportWebVitals((metric) => {
    // Standard tracking
    const performanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      timestamp: new Date().toISOString(),
    };

    trackWebVital(performanceMetric);

    // Custom logic for specific metrics
    switch (metric.name) {
      case 'LCP':
        // Track Largest Contentful Paint specifically
        if (metric.value > 4000) {
          // Very slow LCP - might indicate image loading issues
          console.warn('Very slow LCP detected:', metric.value);
        }
        break;
        
      case 'CLS':
        // Track Cumulative Layout Shift
        if (metric.value > 0.25) {
          // High CLS - might indicate layout instability
          console.warn('High CLS detected:', metric.value);
        }
        break;
        
      case 'FID':
        // Track First Input Delay
        if (metric.value > 300) {
          // High FID - might indicate JavaScript execution issues
          console.warn('High FID detected:', metric.value);
        }
        break;
        
      case 'INP':
        // Track Interaction to Next Paint (newer metric)
        if (metric.value > 500) {
          // High INP - poor interactivity
          console.warn('High INP detected:', metric.value);
        }
        break;
    }
  });
}
