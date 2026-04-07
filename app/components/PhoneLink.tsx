"use client";

import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

interface PhoneLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export function PhoneLink({ href, className, children }: PhoneLinkProps) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => trackEvent(ANALYTICS_EVENTS.CTA_CALL)}
    >
      {children}
    </a>
  );
}
