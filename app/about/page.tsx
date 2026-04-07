import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";

export const metadata: Metadata = {
  title: "About Our Dallas Daycare",
  description:
    "Learn about Riley Day Care, a calm, caring licensed daycare in Southeast Dallas focused on safety, connection, and early learning."
};

export default function AboutPage() {
  return (
    <Section>
      <Container className="space-y-8">
        <SectionHeader eyebrow="About Riley Day Care" title="A calm, caring place for young children.">
          Riley Day Care was created to be a neighborhood daycare where children feel at home and
          parents feel at peace.
        </SectionHeader>
        <div className="grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-5 text-sm leading-relaxed text-slate-700">
            <p>
              Families in Southeast Dallas trust Riley Day Care for a warm, structured environment
              that supports each child&apos;s social, emotional, and early learning needs.
            </p>
            <p>
              Our caregivers build real relationships with children and families, using simple,
              predictable routines that help little ones feel secure from drop-off to pick-up.
            </p>
            <p>
              We prioritize safety, communication, and kindness in every interaction—so parents can
              focus on their day knowing their child is cared for.
            </p>
          </div>
          <div className="space-y-4 rounded-xl border border-slate-100 bg-white p-5 text-sm text-slate-700 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Our care approach</p>
            <ul className="list-disc space-y-2 pl-4">
              <li>Calm, predictable daily rhythm for young children.</li>
              <li>Age-appropriate activities to support development and curiosity.</li>
              <li>Open communication with parents about each child&apos;s day.</li>
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}

