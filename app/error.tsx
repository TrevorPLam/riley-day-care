"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/shared/Button";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error - replace with Sentry in future
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <Section>
      <Container className="space-y-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Something went wrong
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 max-w-md mx-auto">
          We apologize for the inconvenience. Our team has been notified and we&apos;re working to fix the issue.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="primary">
        <div className="flex gap-4 justify-center">
          <Button onClick={unstable_retry} variant="primary">
            Try again
          </Button>
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-light">
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
