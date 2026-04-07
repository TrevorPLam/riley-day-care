/**
 * React 19 Utilities
 * 
 * This file provides utilities and patterns for leveraging React 19 features
 * including the new `use` API, enhanced form handling, and data fetching patterns.
 */

import { use, Suspense } from 'react';
import type { ReactNode } from 'react';

// Enhanced promise wrapper for use API compatibility
export interface Resource<T> {
  read(): T;
}

export function createResource<T>(promise: Promise<T>): Resource<T> {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: T;
  let error: Error;

  promise.then(
    (data) => {
      status = 'success';
      result = data;
    },
    (e) => {
      status = 'error';
      error = e;
    }
  );

  return {
    read(): T {
      switch (status) {
        case 'pending':
          throw promise; // Suspends until promise resolves
        case 'success':
          return result;
        case 'error':
          throw error;
        default:
          throw promise;
      }
    },
  };
}

// Hook for using resources with Suspense
export function useResource<T>(resource: Resource<T>): T {
  return use(resource);
}

// Enhanced data fetching with React 19 use API
export function useFetch<T>(url: string, options?: RequestInit): T {
  const resource = createResource(
    fetch(url, options)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json() as Promise<T>;
      })
  );
  
  return useResource(resource);
}

// Conditional context reading with use API
export function useConditionalContext<T>(context: React.Context<T>, condition: boolean): T | undefined {
  if (!condition) return undefined;
  return use(context);
}

// Suspense wrapper component
interface AsyncBoundaryProps {
  fallback?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}

// Simple error boundary for use with AsyncBoundary
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

export function AsyncBoundary({ fallback = <div>Loading...</div>, error, children }: AsyncBoundaryProps) {
  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary fallback={error}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

// React 19 form utilities
export interface FormState<T> {
  data: T;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

export function createFormAction<T>(
  initialState: FormState<T>,
  submitFn: (data: T) => Promise<void>
) {
  return async (prevState: FormState<T>, formData: FormData): Promise<FormState<T>> => {
    try {
      const data = Object.fromEntries(formData.entries()) as T;
      
      return {
        ...prevState,
        data,
        isSubmitting: true,
        error: null,
      };
    } catch (error) {
      return {
        ...prevState,
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        success: false,
      };
    }
  };
}

// React 19 cache utilities (placeholder for future cache API integration)
export const cache = new Map<string, any>();

export function cachedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const promise = fetcher();
  cache.set(key, promise);
  return promise;
}
