import type { Metadata } from "next";
import Link from "next/link";
import "../styles/globals.css";
import { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { getLocalBusinessJsonLd } from "@/lib/seo/structuredData";
import PlausibleProvider from "next-plausible";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Riley Day Care | Safe, Nurturing Child Care in Dallas, TX",
    template: "%s | Riley Day Care"
  },
  description:
    "Riley Day Care provides safe, nurturing child care in Southeast Dallas, TX. Schedule a tour today at our 1509 Haymarket Rd location.",
  alternates: {
    canonical: "/"
  }
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const jsonLd = getLocalBusinessJsonLd();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-slate-900">
        <PlausibleProvider src="https://plausible.io/js/script.js">
        <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
          <Container className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <Link href="/" className="text-sm font-semibold tracking-tight text-slate-900">
                  Riley Day Care
                </Link>
                <span className="text-xs text-slate-500">
                  1509 Haymarket Rd, Dallas, TX 75253
                </span>
              </div>
              <nav className="hidden items-center gap-4 text-xs font-semibold text-slate-700 sm:flex">
                <Link href="/programs" className="hover:text-brand">
                  Programs
                </Link>
                <Link href="/tuition" className="hover:text-brand">
                  Tuition
                </Link>
                <Link href="/enrollment" className="hover:text-brand">
                  Enrollment
                </Link>
                <Link href="/faq" className="hover:text-brand">
                  FAQ
                </Link>
                <Link href="/contact" className="hover:text-brand">
                  Contact
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="tel:19722860357"
                className="hidden rounded-full border border-brand px-4 py-2 text-xs font-semibold text-brand hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:inline-flex"
              >
                Call (972) 286-0357
              </a>
            </div>
          </Container>
        </header>
        <main>
          {children}
        </main>
        <footer className="mt-10 border-t border-slate-100 py-8 text-xs text-slate-500">
          <Container className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Riley Day Care. All rights reserved.</p>
            <p>
              1509 Haymarket Rd, Dallas, TX 75253 ·{" "}
              <a href="tel:19722860357" className="font-medium text-brand">
                (972) 286-0357
              </a>{" "}
              ·{" "}
              <Link href="/privacy" className="font-medium text-brand">
                Privacy policy
              </Link>
            </p>
          </Container>
        </footer>
        </PlausibleProvider>
      </body>
    </html>
  );
}

