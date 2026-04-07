"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/shared/Button";
import Link from "next/link";

// React 19: Enhanced error categorization
function getErrorCategory(error: Error): 'network' | 'rendering' | 'validation' | 'unknown' {
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return 'network';
  }
  if (error.message.includes('render') || error.name === 'TypeError') {
    return 'rendering';
  }
  if (error.message.includes('validation') || error.message.includes('required')) {
    return 'validation';
  }
  return 'unknown';
}

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorCategory = getErrorCategory(error);

  useEffect(() => {
    // React 19: Enhanced error logging with categorization
    console.error("Error boundary caught:", {
      error,
      category: errorCategory,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // React 19: Could integrate with error reporting service here
    // Example: reportError(error, errorCategory);
  }, [error, errorCategory]);

  const getErrorMessage = () => {
    switch (errorCategory) {
      case 'network':
        return "There was a problem connecting to our services. Please check your internet connection and try again.";
      case 'rendering':
        return "Something went wrong while displaying this page. Our team has been notified.";
      case 'validation':
        return "There was an issue with the information provided. Please check your input and try again.";
      default:
        return "We apologize for the inconvenience. Our team has been notified and we're working to fix the issue.";
    }
  };

  return (
    <Section>
      <Container className="space-y-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Something went wrong
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 max-w-md mx-auto">
          {getErrorMessage()}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="primary">
            Try again
          </Button>
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-light">
            Go back home
          </Link>
        </div>
        {/* React 19: Enhanced error information in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-slate-100 rounded-lg text-left">
            <p className="text-xs text-slate-600 font-mono mb-2">Error ID: {error.digest}</p>
            <p className="text-xs text-slate-600 font-mono mb-2">Category: {errorCategory}</p>
            <details className="text-xs text-slate-500 font-mono">
              <summary className="cursor-pointer hover:text-slate-700">Error details</summary>
              <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
            </details>
          </div>
        )}
      </Container>
    </Section>
  );
}
