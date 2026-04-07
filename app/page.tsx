import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EnrollmentCTA } from "@/app/components/EnrollmentCTA";
import { PhoneLink } from "@/app/components/PhoneLink";
import { CACHE_DURATIONS } from "@/lib/cache";

// ISR: Revalidate homepage every 30 minutes for fresh content while maintaining performance
export const revalidate = CACHE_DURATIONS.HOMEPAGE; // 30 minutes

export const metadata: Metadata = {
  title: "Riley Day Care | Safe, Nurturing Child Care in Southeast Dallas, TX",
  description:
    "Riley Day Care is a warm, licensed daycare in Southeast Dallas offering small-group care, play-based learning, and a calm daily routine for infants, toddlers, and preschoolers."
};

export default function HomePage() {
  return (
    <>
      <Section className="bg-gradient-to-b from-accent-soft/70 to-white pb-16 pt-12 sm:pt-16">
        <Container className="grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center">
          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
              Safe, Nurturing Child Care
            </p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              A warm, licensed daycare in Southeast Dallas where your child can grow and thrive.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-700 sm:text-base">
              Riley Day Care offers small-group care, nurturing teachers, and a predictable daily
              routine at our convenient location on Haymarket Rd in Dallas, TX.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <EnrollmentCTA />
              <PhoneLink
                href="tel:19722860357"
                className="inline-flex items-center text-sm font-semibold text-brand"
              >
                Call (972) 286-0357
              </PhoneLink>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                  ⭐
                </span>
                <span className="max-w-xs">
                  Trusted by Dallas families for safe, loving care.
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-md shadow-slate-200/80">
            <p className="text-sm font-semibold text-slate-900">
              “We knew from the first visit that Riley Day Care was the right place for our child.”
            </p>
            <p className="mt-3 text-xs text-slate-600">– Happy parent in Southeast Dallas</p>
            <div className="mt-5 rounded-xl bg-accent-soft p-4 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">Visit us</p>
              <p>1509 Haymarket Rd</p>
              <p>Dallas, TX 75253</p>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 md:grid-cols-2">
          <SectionHeader
            eyebrow="Why families choose us"
            title="Safety, connection, and learning every day."
          >
            Parents choose Riley Day Care for a calm, loving environment where their children can
            feel known, safe, and excited to learn.
          </SectionHeader>
          <div className="grid gap-6 text-sm text-slate-700 sm:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Licensed & safety-focused</p>
              <p>Clear check-in/out, background-checked staff, and CPR/first aid training.</p>
            </div>
            <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Small-group attention</p>
              <p>Low ratios so each child receives individual care and encouragement.</p>
            </div>
            <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Play-based learning</p>
              <p>Age-appropriate activities that build curiosity, language, and social skills.</p>
            </div>
            <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Convenient Southeast Dallas location</p>
              <p>Easy access from major roads with on-site parking for drop-off and pick-up.</p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

