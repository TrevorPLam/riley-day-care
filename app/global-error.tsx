"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log global error - replace with Sentry in future
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-white text-slate-900 antialiased min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Critical Error
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">
            The application encountered a critical error. We apologize for the inconvenience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition bg-brand text-white hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand"
            >
              Reload application
            </button>
            <a 
              href="/"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition text-brand hover:text-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand"
            >
              Go back home
            </a>
          </div>
          {/* Show error digest in development only */}
          {process.env.NODE_ENV === "development" && error.digest && (
            <p className="text-xs text-slate-400 font-mono">Error ID: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
