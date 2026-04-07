"use client";

import { useOptimistic } from "react";
import { Button } from "@/components/shared/Button";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

interface OptimisticState {
  isTracking: boolean;
  hasTracked: boolean;
}

export function EnrollmentCTA() {
  const [optimisticState, addOptimistic] = useOptimistic(
    { isTracking: false, hasTracked: false },
    (state: OptimisticState, action: 'start-tracking' | 'complete-tracking') => {
      switch (action) {
        case 'start-tracking':
          return { ...state, isTracking: true };
        case 'complete-tracking':
          return { ...state, isTracking: false, hasTracked: true };
        default:
          return state;
      }
    }
  );

  const scrollToEnrollment = async () => {
    // Start optimistic state
    addOptimistic('start-tracking');
    
    // Track analytics event
    try {
      await trackEvent(ANALYTICS_EVENTS.CTA_SCHEDULE_TOUR);
      addOptimistic('complete-tracking');
    } catch (error) {
      console.error('Analytics tracking failed:', error);
      // Still complete the optimistic state even if tracking fails
      addOptimistic('complete-tracking');
    }

    // Scroll to enrollment section
    const el = document.getElementById("enrollment");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.location.assign("/enrollment#enrollment");
  };

  return (
    <Button
      type="button"
      onClick={scrollToEnrollment}
      disabled={optimisticState.isTracking}
      className={optimisticState.hasTracked ? "ring-2 ring-green-500 ring-offset-2" : ""}
    >
      {optimisticState.isTracking ? "Tracking..." : "Schedule a Tour"}
    </Button>
  );
}
