import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";

export const metadata: Metadata = {
  title: "Daycare FAQ for Dallas Families",
  description:
    "Find answers to common questions about safety, schedules, meals, and communication at Riley Day Care in Southeast Dallas."
};

const faqs = [
  {
    question: "What safety measures do you have in place?",
    answer:
      "We use secure check-in/out procedures, maintain locked doors during the day, and follow clear visitor policies. Staff complete background checks and maintain current CPR/first aid training."
  },
  {
    question: "What does a typical day look like?",
    answer:
      "Children follow a calm, predictable rhythm that includes arrival, breakfast, group time, indoor and outdoor play, meals, rest, and closing routines adjusted for each age group."
  },
  {
    question: "How do you handle meals and snacks?",
    answer:
      "We provide age-appropriate meals and snacks where applicable, and we partner with families on allergies and dietary needs. Details are reviewed during enrollment."
  },
  {
    question: "How will you communicate with me about my child?",
    answer:
      "We share daily highlights, important notes, and any concerns at pick-up and via phone as needed. We encourage questions and two-way communication."
  }
];

export default function FaqPage() {
  return (
    <Section>
      <Container className="space-y-8">
        <SectionHeader
          eyebrow="FAQ"
          title="Answers to common questions from Dallas families."
        >
          If you don&apos;t see your question here, we&apos;re happy to talk through details on the
          phone or during a tour.
        </SectionHeader>
        <div className="space-y-4">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                <span>{item.question}</span>
                <span className="text-xs text-slate-500 group-open:hidden">+</span>
                <span className="hidden text-xs text-slate-500 group-open:inline">−</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}

