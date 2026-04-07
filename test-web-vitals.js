/**
 * Test script to verify Web Vitals monitoring
 * Run this in development console to test performance tracking
 */

// Test the performance module directly
import { reportWebVitals, getThreshold, WEB_VITAL_THRESHOLDS } from '../lib/performance';

// Simulate a Web Vitals metric
const testMetric = {
  name: 'LCP',
  value: 2100,
  rating: 'needs-improvement' as const,
  delta: 100,
  id: 'test-metric-123',
  navigationType: 'navigate',
};

console.log('Testing Web Vitals reporting...');
console.log('Thresholds:', WEB_VITAL_THRESHOLDS);
console.log('LCP Threshold:', getThreshold('LCP'));

// Test the reporting function
if (typeof window !== 'undefined') {
  reportWebVitals(testMetric);
  console.log('Web Vitals test completed - check console for grouped output');
} else {
  console.log('This test must be run in a browser environment');
}
