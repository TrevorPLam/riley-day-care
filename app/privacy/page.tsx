import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/shared/SectionHeader";

export const metadata: Metadata = {
  title: "Privacy Policy | Riley Day Care",
  description:
    "Learn how Riley Day Care collects, uses, and protects information shared through our website enrollment form and phone calls."
};

export default function PrivacyPage() {
  return (
    <Section>
      <Container className="space-y-8 text-sm leading-relaxed text-slate-700">
        <SectionHeader eyebrow="Privacy Policy" title="How we handle your information." />
        <div className="space-y-4">
          <p>
            Riley Day Care respects your family&apos;s privacy. This page explains what information
            we collect through this website, how we use it, and the steps we take to keep it safe.
          </p>
          <h2 className="text-sm font-semibold text-slate-900">Information we collect</h2>
          <p>
            When you submit an enrollment or tour request form, we collect the details you provide,
            such as:
          </p>
          <ul className="list-disc space-y-1 pl-4">
            <li>Parent or guardian name</li>
            <li>Child&apos;s name and age</li>
            <li>Preferred start date</li>
            <li>Phone number and email address</li>
            <li>Any additional information you choose to share in the message field</li>
          </ul>
          <p>
            We may also receive basic technical information sent by your browser, such as your IP
            address and browser type. We use this only to help protect our website from spam and
            abuse.
          </p>
          <h2 className="text-sm font-semibold text-slate-900">How we use your information</h2>
          <p>We use the information you share with us to:</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>Respond to your questions about our programs, tuition, and availability</li>
            <li>Schedule and confirm tours</li>
            <li>Follow up about next steps in the enrollment process</li>
          </ul>
          <p>
            We do not sell your information or share it with unrelated third parties for marketing
            purposes.
          </p>
          <h2 className="text-sm font-semibold text-slate-900">Analytics</h2>
          <p>
            Our website may use privacy-focused analytics tools to understand how families find and
            use our site. These tools help us improve our content and do not show us your name or
            the name of your child.
          </p>
          <h2 className="text-sm font-semibold text-slate-900">Data retention</h2>
          <p>
            We keep enrollment and tour inquiries only as long as reasonably necessary to respond to
            your request and manage our enrollment process. After that, information may be archived
            or deleted in accordance with our operational and legal requirements.
          </p>
          <h2 className="text-sm font-semibold text-slate-900">How we protect your information</h2>
          <p>
            We use reasonable technical and administrative safeguards to protect information against
            unauthorized access, loss, or misuse. No system can be guaranteed 100% secure, but we
            work to limit who can see your information and how long we keep it.
          </p>
          <h2 className="text-sm font-semibold text-slate-900">Children&apos;s information</h2>
          <p>
            Our website is intended for parents and guardians. Information about children is
            provided to us by adults for the purpose of enrollment and care. If you believe we have
            received a child&apos;s information in a way that concerns you, please contact us so we
            can review and address it.
          </p>
          <h2 className="text-sm font-semibold text-slate-900">Your choices and questions</h2>
          <p>
            If you would like to update or request deletion of information you&apos;ve shared with
            us, or if you have questions about this policy, please call our center at{" "}
            <a href="tel:19722860357" className="font-semibold text-brand">
              (972) 286-0357
            </a>
            .
          </p>
        </div>
      </Container>
    </Section>
  );
}
