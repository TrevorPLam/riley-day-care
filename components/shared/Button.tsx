"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

const base =
  "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "bg-accent text-slate-900 hover:bg-accent-soft",
  ghost: "bg-transparent text-brand hover:bg-accent-soft"
};

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

