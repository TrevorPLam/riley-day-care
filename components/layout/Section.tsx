import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className = "", id }: SectionProps) {
  return (
    <section id={id} className={`py-10 sm:py-14 lg:py-16 ${className}`}>
      {children}
    </section>
  );
}

