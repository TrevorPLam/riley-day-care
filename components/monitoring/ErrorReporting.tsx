"use client";

import { ReactNode, useEffect } from 'react';
import { errorMonitoring } from '@/lib/monitoring';
import * as Sentry from '@sentry/nextjs';

/**
 * Error Boundary Component with Enhanced Reporting
 * 
 * Catches React errors and reports them with comprehensive context
 * and categorization for better debugging and monitoring.
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: any) => void;
  component?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Report error with comprehensive context
    const errorCategory = errorMonitoring.reportError(error, {
      component: this.props.component || 'Unknown',
      errorBoundary: true,
      reactErrorInfo: errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Add breadcrumb for error boundary trigger
    Sentry.addBreadcrumb({
      message: `Error Boundary Triggered: ${error.message}`,
      category: 'error_boundary',
      level: 'error',
      data: {
        component: this.props.component,
        errorCategory,
        stackTrace: error.stack,
      },
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback Component
 */
function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Something went wrong
        </h2>
        
        <p className="text-sm text-slate-600 mb-6">
          We're sorry, but something unexpected happened. Our team has been notified and is working to fix the issue.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
          >
            Try Again
          </button>
          
          <a
            href="/"
            className="block w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Go Back Home
          </a>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-700">
              Error Details (Development Only)
            </summary>
            <div className="mt-2 p-3 bg-slate-100 rounded text-xs font-mono text-slate-700">
              <p className="font-semibold mb-1">Error:</p>
              <p className="mb-2">{error.message}</p>
              <p className="font-semibold mb-1">Stack:</p>
              <pre className="whitespace-pre-wrap">{error.stack}</pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for API Error Reporting
 * 
 * Provides utilities for reporting API errors with proper context
 * and categorization.
 */
export function useAPIErrorReporting() {
  const reportAPIError = (
    error: Error,
    endpoint: string,
    statusCode?: number,
    requestBody?: any,
    additionalContext?: Record<string, any>
  ) => {
    return errorMonitoring.reportAPIError(error, endpoint, statusCode, requestBody);
  };

  const reportNetworkError = (
    error: Error,
    url: string,
    method: string,
    additionalContext?: Record<string, any>
  ) => {
    return errorMonitoring.reportError(error, {
      type: 'network_error',
      url,
      method,
      ...additionalContext,
    });
  };

  const reportValidationError = (
    error: Error,
    field: string,
    value: any,
    additionalContext?: Record<string, any>
  ) => {
    return errorMonitoring.reportError(error, {
      type: 'validation_error',
      field,
      value: typeof value === 'string' ? value : JSON.stringify(value),
      ...additionalContext,
    });
  };

  return {
    reportAPIError,
    reportNetworkError,
    reportValidationError,
  };
}

/**
 * Higher-order component for automatic error reporting
 */
export function withErrorReporting<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    component?: string;
    fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
    onError?: (error: Error, errorInfo: any) => void;
  }
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary
        component={options?.component || Component.name}
        fallback={options?.fallback}
        onError={options?.onError}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Error Reporting Utilities
 */
export const errorReportingUtils = {
  /**
   * Report form submission errors with context
   */
  reportFormError: (
    error: Error,
    formName: string,
    formData: Record<string, any>,
    step?: string
  ) => {
    return errorMonitoring.reportError(error, {
      type: 'form_error',
      formName,
      step,
      formData: JSON.stringify(formData),
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Report user interaction errors
   */
  reportInteractionError: (
    error: Error,
    action: string,
    element: string,
    additionalContext?: Record<string, any>
  ) => {
    return errorMonitoring.reportError(error, {
      type: 'interaction_error',
      action,
      element,
      ...additionalContext,
    });
  },

  /**
   * Report performance errors
   */
  reportPerformanceError: (
    error: Error,
    metric: string,
    value: number,
    threshold: number
  ) => {
    return errorMonitoring.reportError(error, {
      type: 'performance_error',
      metric,
      value,
      threshold,
      deviation: value - threshold,
    });
  },

  /**
   * Report security-related errors
   */
  reportSecurityError: (
    error: Error,
    securityEvent: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    additionalContext?: Record<string, any>
  ) => {
    return errorMonitoring.reportError(error, {
      type: 'security_error',
      securityEvent,
      severity,
      ...additionalContext,
    });
  },

  /**
   * Create error report for manual submission
   */
  createErrorReport: (
    error: Error,
    category: string,
    context: Record<string, any>
  ) => {
    const report = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      category,
      context,
      environment: process.env.NODE_ENV,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Server',
    };

    // Send to Sentry
    Sentry.captureException(error, {
      tags: {
        category,
        report_id: report.id,
      },
      extra: context,
    });

    return report;
  },
};

/**
 * Error Reporting Context Provider
 */
import { createContext, useContext, useState } from 'react';

interface ErrorReportingContextType {
  errors: Array<{
    id: string;
    error: Error;
    category: string;
    timestamp: string;
  }>;
  reportError: (error: Error, context?: Record<string, any>) => string;
  clearErrors: () => void;
  getErrorById: (id: string) => any;
}

const ErrorReportingContext = createContext<ErrorReportingContextType | null>(null);

export function ErrorReportingProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<Array<{
    id: string;
    error: Error;
    category: string;
    timestamp: string;
  }>>([]);

  const reportError = (error: Error, context?: Record<string, any>): string => {
    const category = errorMonitoring.reportError(error, context);
    const errorId = Math.random().toString(36).substr(2, 9);
    
    const errorEntry = {
      id: errorId,
      error,
      category,
      timestamp: new Date().toISOString(),
    };

    setErrors(prev => [...prev, errorEntry]);
    return errorId;
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const getErrorById = (id: string) => {
    return errors.find(err => err.id === id);
  };

  return (
    <ErrorReportingContext.Provider value={{
      errors,
      reportError,
      clearErrors,
      getErrorById,
    }}>
      {children}
    </ErrorReportingContext.Provider>
  );
}

export function useErrorReporting() {
  const context = useContext(ErrorReportingContext);
  if (!context) {
    throw new Error('useErrorReporting must be used within ErrorReportingProvider');
  }
  return context;
}
