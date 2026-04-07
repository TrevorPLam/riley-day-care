"use client";

import { useActionState, useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/shared/Button";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { submitEnrollment, requestCsrfToken } from "./actions";

export default function EnrollmentPageClient() {
  const [state, submitAction, isPending] = useActionState(submitEnrollment, {
    error: null,
    success: false,
  });

  const [csrfToken, setCsrfToken] = useState("");

  // Fetch CSRF token when component mounts
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const token = await requestCsrfToken();
        if (token) {
          setCsrfToken(token);
        }
      } catch (err) {
        console.error("Failed to fetch CSRF token:", err);
      }
    };

    fetchCsrfToken();
  }, []);

  // Track successful submissions
  useEffect(() => {
    if (state.success) {
      trackEvent(ANALYTICS_EVENTS.FORM_ENROLLMENT_SUBMIT);
    }
  }, [state.success]);

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
          aria-describedby={state.error ? "enrollment-error" : undefined}
          noValidate
          action={submitAction}
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
                disabled={isPending}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 disabled:opacity-50"
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
                disabled={isPending}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 disabled:opacity-50"
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
                disabled={isPending}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 disabled:opacity-50"
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
                disabled={isPending}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 disabled:opacity-50"
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
                disabled={isPending}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 disabled:opacity-50"
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
                disabled={isPending}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 disabled:opacity-50"
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
              disabled={isPending}
              className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Button type="submit" useFormStatusPending={true} disabled={!csrfToken}>
                Submit request
              </Button>
              <div className="min-h-[1.5rem]" aria-live="polite" id="enrollment-error">
                {state.success ? (
                  <p className="text-xs text-emerald-700">
                    Thank you - your request has been received. We&apos;ll follow up soon.
                  </p>
                ) : null}
                {state.error ? (
                  <p className="text-xs text-red-600">{state.error}</p>
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

