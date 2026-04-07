export const ANALYTICS_EVENTS = {
  CTA_SCHEDULE_TOUR: "cta_schedule_tour_click",
  CTA_CALL: "cta_call_click",
  FORM_ENROLLMENT_SUBMIT: "form_enrollment_submit"
} as const;

export type AnalyticsEventKey = keyof typeof ANALYTICS_EVENTS;

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

export function trackEvent(event: (typeof ANALYTICS_EVENTS)[AnalyticsEventKey]) {
  if (typeof window !== "undefined" && typeof window.plausible === "function") {
    window.plausible(event);
  }
}

