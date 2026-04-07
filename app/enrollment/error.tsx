"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/shared/Button";
import Link from "next/link";

export default function EnrollmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log enrollment-specific error - replace with Sentry in future
    console.error("Enrollment error boundary caught:", error);
  }, [error]);

  return (
    <Section>
      <Container className="space-y-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Enrollment form error
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 max-w-md mx-auto">
          There was an issue with the enrollment form. Please try again or contact us directly if the problem persists.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="primary">
            Try again
          </Button>
          <Link href="/contact" className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-light">
            Contact us
          </Link>
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900">
            Go back home
          </Link>
        </div>
        {/* Show error digest in development only */}
        {process.env.NODE_ENV === "development" && error.digest && (
          <p className="text-xs text-slate-400 font-mono">Error ID: {error.digest}</p>
        )}
      </Container>
    </Section>
  );
}
