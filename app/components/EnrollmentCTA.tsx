"use client";

import { Button } from "@/components/shared/Button";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

export function EnrollmentCTA() {
  const scrollToEnrollment = () => {
    const el = document.getElementById("enrollment");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Button
      type="button"
      onClick={() => {
        trackEvent(ANALYTICS_EVENTS.CTA_SCHEDULE_TOUR);
        scrollToEnrollment();
      }}
    >
      Schedule a Tour
    </Button>
  );
}
