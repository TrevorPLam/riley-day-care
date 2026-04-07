import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";

export const metadata: Metadata = {
  title: "Contact Riley Day Care in Southeast Dallas",
  description:
    "Call or visit Riley Day Care on Haymarket Rd in Southeast Dallas, TX to ask questions or schedule a tour."
};

export default function ContactPage() {
  return (
    <Section>
      <Container className="space-y-8">
        <SectionHeader
          eyebrow="Contact"
          title="We’re here to answer your questions."
        >
          Reach out to learn more about our programs, schedule a tour, or ask about availability.
        </SectionHeader>
        <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-4 text-sm leading-relaxed text-slate-700">
            <p className="text-sm font-semibold text-slate-900">Visit or call</p>
            <p>Riley Day Care</p>
            <p>1509 Haymarket Rd</p>
            <p>Dallas, TX 75253</p>
            <p>
              Phone:{" "}
              <a href="tel:19722860357" className="font-semibold text-brand">
                (972) 286-0357
              </a>
            </p>
            <p className="text-xs text-slate-500">
              Please call ahead to schedule a tour so we can give you and your child our full
              attention.
            </p>
          </div>
          <aside className="space-y-3 rounded-xl border border-slate-100 bg-white p-5 text-xs text-slate-700 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Driving directions</p>
            <p>
              We&apos;re located on Haymarket Rd in Southeast Dallas. Once you arrive, look for our
              signage and designated parking area near the entrance.
            </p>
          </aside>
        </div>
      </Container>
    </Section>
  );
}

