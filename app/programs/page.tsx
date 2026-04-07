import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";

export const metadata: Metadata = {
  title: "Infant, Toddler, and Preschool Programs in Southeast Dallas",
  description:
    "Explore Riley Day Care programs for infants, toddlers, and preschoolers in Southeast Dallas, TX with small-group, play-based learning."
};

const programs = [
  {
    name: "Infants",
    ageRange: "6 weeks – 12 months",
    summary: "Gentle, responsive care with plenty of snuggles and calm routines."
  },
  {
    name: "Toddlers",
    ageRange: "1 – 3 years",
    summary: "Safe exploration, early language, and simple routines to build independence."
  },
  {
    name: "Preschool",
    ageRange: "3 – 5 years",
    summary: "Play-based pre-K skills, social learning, and school-readiness activities."
  }
];

export default function ProgramsPage() {
  return (
    <Section>
      <Container className="space-y-8">
        <SectionHeader
          eyebrow="Programs"
          title="Age-appropriate care for every stage."
        >
          From first smiles to school readiness, Riley Day Care offers small-group programs that
          meet children where they are.
        </SectionHeader>
        <div className="grid gap-6 sm:grid-cols-3">
          {programs.map((program) => (
            <article
              key={program.name}
              className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-slate-900">{program.name}</h3>
              <p className="text-xs font-medium uppercase tracking-wide text-brand">
                {program.ageRange}
              </p>
              <p>{program.summary}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}

