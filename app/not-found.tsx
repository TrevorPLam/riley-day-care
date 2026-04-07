import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export default function NotFound() {
  return (
    <Section>
      <Container className="space-y-4 text-sm leading-relaxed text-slate-700">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Page not found
        </h1>
        <p>
          The page you&apos;re looking for doesn&apos;t exist or may have been moved. Please use
          the navigation above or return to the home page.
        </p>
        <Link href="/" className="text-sm font-semibold text-brand hover:text-brand-light">
          Go back home
        </Link>
      </Container>
    </Section>
  );
}

