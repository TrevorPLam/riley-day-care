import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TuitionCTA } from "@/app/components/TuitionCTA";

export const metadata: Metadata = {
  title: "Tuition & Hours | Riley Day Care in Dallas",
  description:
    "Learn how Riley Day Care in Southeast Dallas approaches tuition and hours so your family can plan with confidence."
};

export default function TuitionPage() {
  return (
    <Section>
      <Container className="space-y-8">
        <SectionHeader
          eyebrow="Tuition & Hours"
          title="Clear expectations for your family’s schedule and budget."
        >
          We keep tuition simple and transparent so you can plan with confidence.
        </SectionHeader>
        <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-4 text-sm leading-relaxed text-slate-700">
            <p>
              Tuition at Riley Day Care reflects small-group care, experienced caregivers, and
              resources to support your child&apos;s learning and growth.
            </p>
            <p>
              Because each family&apos;s schedule and needs are unique, we&apos;ll share current
              tuition rates during your tour or phone consultation and explain exactly what is
              included.
            </p>
            <ul className="list-disc space-y-2 pl-4">
              <li>Full-time and part-time options (subject to availability).</li>
              <li>Healthy meals and snacks provided where applicable.</li>
              <li>Curriculum materials and classroom supplies included.</li>
            </ul>
          </div>
          <aside className="space-y-4 rounded-xl border border-slate-100 bg-white p-5 text-sm text-slate-700 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Request current tuition and availability.
            </p>
            <p>
              Share your child&apos;s age and preferred start date, and we&apos;ll follow up with
              details tailored to your family.
            </p>
            <TuitionCTA />
            <p className="text-xs text-slate-500">
              No obligation. We&apos;ll simply share current rates and answer your questions.
            </p>
          </aside>
        </div>
      </Container>
    </Section>
  );
}

