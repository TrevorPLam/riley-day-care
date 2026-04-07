"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

// React 19: Enhanced error categorization for global errors
function getGlobalErrorCategory(error: Error): 'critical' | 'hydration' | 'build' | 'unknown' {
  const message = error.message.toLowerCase();

  if (message.includes('hydration') || message.includes('ssr')) {
    return 'hydration';
  }
  if (message.includes('build') || message.includes('module')) {
    return 'build';
  }
  if (error.name === 'TypeError' || message.includes('critical')) {
    return 'critical';
  }
  return 'unknown';
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorCategory = getGlobalErrorCategory(error);

  useEffect(() => {
    // Capture error in Sentry
    Sentry.captureException(error);
    
    // React 19: Enhanced global error logging with context
    console.error("Global error boundary caught:", {
      error,
      category: errorCategory,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      isCritical: errorCategory === 'critical'
    });

    // React 19: Global errors should be reported immediately
    // Example: reportCriticalError(error, errorCategory);
  }, [error, errorCategory]);

  const getGlobalErrorMessage = () => {
    switch (errorCategory) {
      case 'hydration':
        return "There was a problem loading the page. This usually happens when the server and client content don't match.";
      case 'build':
        return "The application has a build error. Please try refreshing the page or contact support if the issue persists.";
      case 'critical':
        return "A critical error occurred in the application. Our team has been automatically notified.";
      default:
        return "The application encountered an unexpected error. We apologize for the inconvenience.";
    }
  };

  return (
    <html>
      <body className="bg-white text-slate-900 antialiased min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Critical Error
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">
            {getGlobalErrorMessage()}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition bg-brand text-white hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand"
            >
              Reload application
            </button>
            <Link 
              href="/"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition text-brand hover:text-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand"
            >
              Go back home
            </Link>
          </div>
          {/* React 19: Enhanced global error information in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-xs text-red-600 font-mono mb-2">Global Error ID: {error.digest}</p>
              <p className="text-xs text-red-600 font-mono mb-2">Category: {errorCategory}</p>
              <details className="text-xs text-red-500 font-mono">
                <summary className="cursor-pointer hover:text-red-700">Global error details</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">{error.stack}</pre>
              </details>
              <div className="mt-4 text-xs text-red-600">
                <p className="font-semibold">Next steps:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Check the error stack trace above</li>
                  <li>Verify server/client component boundaries</li>
                  <li>Check for hydration mismatches</li>
                  <li>Review recent code changes</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
