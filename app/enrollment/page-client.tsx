"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/shared/Button";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

type SubmissionState = "idle" | "submitting" | "success" | "error";
type SubmissionError = string | null;

export default function EnrollmentPageClient() {
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [error, setError] = useState<SubmissionError>(null);
  const [csrfToken, setCsrfToken] = useState<string>("");

  // Fetch CSRF token when component mounts
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("/api/csrf");
        const data = await response.json();
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
      } catch (err) {
        console.error("Failed to fetch CSRF token:", err);
      }
    };

    fetchCsrfToken();
  }, []);

  return (
    <Section id="enrollment">
      <Container className="space-y-8">
        <SectionHeader
          eyebrow="Enrollment"
          title="Schedule a tour and check availability."
        >
          Share a few details about your family and we&apos;ll follow up to confirm a tour time and
          talk through next steps.
        </SectionHeader>
        <form
          className="space-y-5 rounded-xl border border-slate-100 bg-white p-5 text-sm text-slate-700 shadow-sm"
          aria-describedby={error ? "enrollment-error" : undefined}
          noValidate
          onSubmit={async (event) => {
            event.preventDefault();
            if (status === "submitting" || !csrfToken) return;

            const form = event.currentTarget;
            const formData = new FormData(form);

            // Honeypot field – real visitors will not fill this
            if (formData.get("extraInfo")) {
              return;
            }

            const message = (formData.get("message") as string | null) || "";
            if (message && message.trim().length > 0 && message.trim().length < 10) {
              setError("Please share a bit more detail in the message field.");
              setStatus("error");
              return;
            }

            const payload = Object.fromEntries(formData.entries());

            try {
              setStatus("submitting");
              setError(null);

              const response = await fetch("/api/enrollment", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
              });

              const json = (await response.json().catch(() => null)) as
                | { ok?: boolean; error?: string }
                | null;

              if (!response.ok || !json?.ok) {
                const messageText =
                  json?.error ||
                  "We could not submit your request. Please check your details and try again.";
                setError(messageText);
                setStatus("error");
                return;
              }

              trackEvent(ANALYTICS_EVENTS.FORM_ENROLLMENT_SUBMIT);
              setStatus("success");
              setError(null);
              form.reset();
            } catch {
              setError("Something went wrong. Please try again or give us a call.");
              setStatus("error");
            }
          }}
        >
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="extraInfo">Additional information</label>
            <input id="extraInfo" name="extraInfo" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          {/* CSRF protection token */}
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-900" htmlFor="parentName">
                Parent/guardian name
              </label>
              <input
                id="parentName"
                name="parentName"
                type="text"
                autoComplete="name"
                required
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-900" htmlFor="childName">
                Child&apos;s name
              </label>
              <input
                id="childName"
                name="childName"
                type="text"
                required
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-900" htmlFor="childAge">
                Child&apos;s age
              </label>
              <input
                id="childAge"
                name="childAge"
                type="text"
                required
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-900" htmlFor="startDate">
                Preferred start date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                required
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-900" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-900" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-900" htmlFor="message">
              Anything else you&apos;d like us to know?
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Button type="submit" disabled={status === "submitting" || !csrfToken}>
                {status === "submitting" ? "Submitting..." : !csrfToken ? "Loading..." : "Submit request"}
              </Button>
              <div className="min-h-[1.5rem]" aria-live="polite" id="enrollment-error">
                {status === "success" ? (
                  <p className="text-xs text-emerald-700">
                    Thank you — your request has been received. We&apos;ll follow up soon.
                  </p>
                ) : null}
                {error && status === "error" ? (
                  <p className="text-xs text-red-600">{error}</p>
                ) : null}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              We&apos;ll be in touch within one business day to confirm your tour time or answer
              questions.
            </p>
          </div>
        </form>
      </Container>
    </Section>
  );
}

