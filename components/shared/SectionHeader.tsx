import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  children,
  align = "left"
}: SectionHeaderProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col gap-2 ${alignment}`}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {children ? (
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {children}
        </p>
      ) : null}
    </div>
  );
}

