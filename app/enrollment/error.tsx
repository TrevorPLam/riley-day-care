"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/shared/Button";
import Link from "next/link";

// React 19: Enhanced enrollment error categorization
function getEnrollmentErrorCategory(error: Error): 'form-validation' | 'submission' | 'csrf' | 'rate-limit' | 'unknown' {
  if (error.message.includes('validation') || error.message.includes('required')) {
    return 'form-validation';
  }
  if (error.message.includes('submit') || error.message.includes('network')) {
    return 'submission';
  }
  if (error.message.includes('csrf') || error.message.includes('token')) {
    return 'csrf';
  }
  if (error.message.includes('rate') || error.message.includes('limit')) {
    return 'rate-limit';
  }
  return 'unknown';
}

export default function EnrollmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorCategory = getEnrollmentErrorCategory(error);

  useEffect(() => {
    // React 19: Enhanced enrollment error logging with context
    console.error("Enrollment error boundary caught:", {
      error,
      category: errorCategory,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      page: 'enrollment'
    });

    // React 19: Enrollment errors should be tracked for analytics
    // Example: trackEnrollmentError(error, errorCategory);
  }, [error, errorCategory]);

  const getEnrollmentErrorMessage = () => {
    switch (errorCategory) {
      case 'form-validation':
        return "There was an issue with the information provided in the enrollment form. Please check your input and try again.";
      case 'submission':
        return "There was a problem submitting your enrollment request. Please try again or contact us directly.";
      case 'csrf':
        return "The security token for your form has expired. Please refresh the page and try again.";
      case 'rate-limit':
        return "Too many enrollment attempts have been made. Please wait a moment before trying again.";
      default:
        return "There was an issue with the enrollment form. Please try again or contact us directly if the problem persists.";
    }
  };

  const getSecondaryActions = () => {
    switch (errorCategory) {
      case 'form-validation':
        return (
          <Link href="/contact" className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-light">
            Contact us instead
          </Link>
        );
      case 'submission':
        return (
          <Link href="tel:555-0123" className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-light">
            Call us directly
          </Link>
        );
      case 'csrf':
        return (
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-light"
          >
            Refresh page
          </button>
        );
      default:
        return (
          <Link href="/contact" className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-light">
            Contact us
          </Link>
        );
    }
  };

  return (
    <Section>
      <Container className="space-y-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Enrollment form error
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 max-w-md mx-auto">
          {getEnrollmentErrorMessage()}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="primary">
            Try again
          </Button>
          {getSecondaryActions()}
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900">
            Go back home
          </Link>
        </div>
        {/* React 19: Enhanced enrollment error information in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
            <p className="text-xs text-amber-600 font-mono mb-2">Enrollment Error ID: {error.digest}</p>
            <p className="text-xs text-amber-600 font-mono mb-2">Category: {errorCategory}</p>
            <details className="text-xs text-amber-500 font-mono">
              <summary className="cursor-pointer hover:text-amber-700">Error details</summary>
              <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
            </details>
            <div className="mt-4 text-xs text-amber-600">
              <p className="font-semibold">Enrollment debugging tips:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Check form validation schema in lib/validation/enrollment.ts</li>
                <li>Verify CSRF token handling in lib/csrf.ts</li>
                <li>Check rate limiting configuration</li>
                <li>Review email service configuration</li>
              </ul>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
