"use client";

import { useEffect, useCallback } from 'react';
import * as Sentry from '@sentry/nextjs';
import { applicationMonitoring } from '@/lib/monitoring';

/**
 * User Journey Analytics Hook
 * 
 * Provides comprehensive user journey tracking with Sentry transactions
 * for monitoring user behavior, conversion funnels, and performance.
 */
export function useUserJourneyAnalytics() {
  // Track page views with transaction
  const trackPageView = useCallback((path?: string) => {
    const currentPath = path || window.location.pathname;
    
    // Create Sentry transaction for page view
    const transaction = Sentry.startTransaction({
      name: `page_view_${currentPath}`,
      op: 'navigation',
      data: {
        path: currentPath,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      },
    });

    // Track page view event
    applicationMonitoring.trackUserJourney({
      sessionId: getSessionId(),
      eventType: 'page_view',
      eventName: `page_view_${currentPath}`,
      path: currentPath,
      properties: {
        referrer: document.referrer,
        title: document.title,
      },
    });

    // Finish transaction after page load
    if (document.readyState === 'complete') {
      transaction.finish();
    } else {
      window.addEventListener('load', () => transaction.finish(), { once: true });
    }

    return transaction;
  }, []);

  // Track form interactions with transaction
  const trackFormInteraction = useCallback((
    formName: string, 
    action: 'start' | 'submit' | 'error',
    properties?: Record<string, any>
  ) => {
    const transaction = Sentry.startTransaction({
      name: `form_${action}_${formName}`,
      op: 'form',
      data: {
        formName,
        action,
        path: window.location.pathname,
        ...properties,
      },
    });

    // Track form event
    applicationMonitoring.trackFormInteraction(formName, action, properties);

    return transaction;
  }, []);

  // Track CTA clicks with transaction
  const trackCTAClick = useCallback((
    ctaName: string, 
    destination?: string,
    properties?: Record<string, any>
  ) => {
    const transaction = Sentry.startTransaction({
      name: `cta_click_${ctaName}`,
      op: 'click',
      data: {
        ctaName,
        destination,
        path: window.location.pathname,
        ...properties,
      },
    });

    // Track CTA click event
    applicationMonitoring.trackCTAClick(ctaName, destination);

    // Add breadcrumb for CTA analysis
    Sentry.addBreadcrumb({
      message: `CTA Clicked: ${ctaName}`,
      category: 'user_interaction',
      level: 'info',
      data: {
        ctaName,
        destination,
        path: window.location.pathname,
        properties,
      },
    });

    return transaction;
  }, []);

  // Track conversions with transaction
  const trackConversion = useCallback((
    conversionType: string, 
    value?: number,
    properties?: Record<string, any>
  ) => {
    const transaction = Sentry.startTransaction({
      name: `conversion_${conversionType}`,
      op: 'conversion',
      data: {
        conversionType,
        value,
        path: window.location.pathname,
        ...properties,
      },
    });

    // Track conversion event
    applicationMonitoring.trackConversion(conversionType, value);

    // Set user context for conversion tracking
    Sentry.setUser({
      sessionId: getSessionId(),
      lastConversion: conversionType,
      lastConversionValue: value,
    });

    return transaction;
  }, []);

  // Track user session start
  const trackSessionStart = useCallback(() => {
    const sessionId = getSessionId();
    
    Sentry.addBreadcrumb({
      message: 'Session Started',
      category: 'session',
      level: 'info',
      data: {
        sessionId,
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
      },
    });

    // Track session metrics
    Sentry.metrics.increment('sessions.started', 1, {
      new_user: !sessionStorage.getItem('returning_user') ? 'true' : 'false',
    });

    // Mark as returning user
    sessionStorage.setItem('returning_user', 'true');
  }, []);

  // Track user engagement
  const trackEngagement = useCallback((action: string, properties?: Record<string, any>) => {
    Sentry.addBreadcrumb({
      message: `User Engagement: ${action}`,
      category: 'engagement',
      level: 'info',
      data: {
        action,
        path: window.location.pathname,
        properties,
      },
    });

    // Track engagement metrics
    Sentry.metrics.increment('user_engagement.events', 1, {
      action,
    });
  }, []);

  // Auto-track page views on route changes
  useEffect(() => {
    // Track initial page view
    trackPageView();
    
    // Track session start
    if (!sessionStorage.getItem('session_tracked')) {
      trackSessionStart();
      sessionStorage.setItem('session_tracked', 'true');
    }

    // Listen for route changes (for SPA navigation)
    const handleRouteChange = () => {
      trackPageView();
    };

    // Note: In Next.js App Router, you might need to use
    // next/router or next/navigation hooks for route change detection
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [trackPageView, trackSessionStart]);

  return {
    trackPageView,
    trackFormInteraction,
    trackCTAClick,
    trackConversion,
    trackEngagement,
  };
}

/**
 * Higher-order component for automatic user journey tracking
 */
export function withUserJourneyTracking<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    trackPageViews?: boolean;
    trackEngagement?: boolean;
    componentName?: string;
  }
) {
  return function TrackedComponent(props: P) {
    const { trackPageView, trackEngagement } = useUserJourneyAnalytics();
    const componentName = options?.componentName || Component.name;

    useEffect(() => {
      if (options?.trackPageViews !== false) {
        trackPageView();
      }
    }, [trackPageView]);

    const enhancedProps = {
      ...props,
      // Add tracking functions to component props
      trackFormInteraction: applicationMonitoring.trackFormInteraction,
      trackCTAClick: applicationMonitoring.trackCTAClick,
      trackConversion: applicationMonitoring.trackConversion,
      trackEngagement: options?.trackEngagement !== false ? trackEngagement : undefined,
    };

    return <Component {...enhancedProps} />;
  };
}

// Helper function to get session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('user_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('user_session_id', sessionId);
  }
  return sessionId;
}

/**
 * React Hook for tracking enrollment funnel specifically
 */
export function useEnrollmentFunnelTracking() {
  const { trackFormInteraction, trackCTAClick, trackConversion } = useUserJourneyAnalytics();

  const trackFunnelStep = useCallback((step: string, properties?: Record<string, any>) => {
    Sentry.addBreadcrumb({
      message: `Enrollment Funnel: ${step}`,
      category: 'funnel',
      level: 'info',
      data: {
        funnel: 'enrollment',
        step,
        path: window.location.pathname,
        properties,
      },
    });

    // Track funnel progression
    Sentry.metrics.increment('enrollment_funnel.step_views', 1, {
      step,
    });
  }, []);

  const trackEnrollmentStart = useCallback(() => {
    trackFunnelStep('started');
    return trackFormInteraction('enrollment', 'start');
  }, [trackFormInteraction, trackFunnelStep]);

  const trackEnrollmentSubmit = useCallback((properties?: Record<string, any>) => {
    trackFunnelStep('submitted', properties);
    return trackFormInteraction('enrollment', 'submit', properties);
  }, [trackFormInteraction, trackFunnelStep]);

  const trackEnrollmentSuccess = useCallback((value?: number) => {
    trackFunnelStep('completed');
    return trackConversion('enrollment_success', value);
  }, [trackConversion, trackFunnelStep]);

  return {
    trackFunnelStep,
    trackEnrollmentStart,
    trackEnrollmentSubmit,
    trackEnrollmentSuccess,
  };
}
