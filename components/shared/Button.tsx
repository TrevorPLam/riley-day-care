"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  useFormStatusPending?: boolean; // Auto-disable when parent form is pending
}

const base =
  "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "bg-accent text-slate-900 hover:bg-accent-soft",
  ghost: "bg-transparent text-brand hover:bg-accent-soft"
};

export function Button({ children, variant = "primary", className = "", useFormStatusPending = false, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  
  // Auto-disable when form is pending if useFormStatusPending is true
  const disabled = props.disabled || (useFormStatusPending && pending);
  
  return (
    <button 
      className={`${base} ${variants[variant]} ${className} ${pending && useFormStatusPending ? 'opacity-75 cursor-not-allowed' : ''}`} 
      disabled={disabled}
      {...props}
    >
      {pending && useFormStatusPending ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

