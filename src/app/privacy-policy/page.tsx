import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Privacy Policy | ZOQ's Gallery",
  description:
    "How ZOQ's Gallery collects, uses, and protects your information.",
  robots: { index: false, follow: true },
};

const LAST_UPDATED = "13 September 2026";

export default function PrivacyPolicyPage() {
  return (
    <Container className="py-10 sm:py-16">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />

      <div className="mx-auto flex max-w-3xl flex-col gap-8 pt-6">
        <div className="flex flex-col gap-2">
          <Heading variant="h1" as="h1">
            Privacy Policy
          </Heading>
          <Text variant="bodySm" className="text-muted">
            Last updated {LAST_UPDATED}
          </Text>
        </div>

        <Text variant="body" className="text-muted">
          This policy explains what information {siteConfig.name} collects
          when you shop with us, how we use it, and the choices you have. By
          using this website or placing an order, you agree to the practices
          described here.
        </Text>

        <Section title="Information We Collect">
          <List
            items={[
              "Contact and shipping details you provide at checkout — name, email, phone number, and delivery address — whether or not you create an account.",
              "Account information, if you register: your email and any profile details you add.",
              "Order details: items purchased, quantities, prices, payment method chosen, and order status.",
              "Basic usage data collected automatically through Vercel Analytics (pages viewed, general device/browser type) to help us understand how the site is used. This does not identify you individually.",
            ]}
          />
        </Section>

        <Section title="Payment Information">
          <Text variant="body" className="text-muted">
            We do not collect or store card numbers. Orders are paid via Cash
            on Delivery, bank transfer, Easypaisa, or JazzCash. For bank
            transfer and mobile wallet payments, you share your payment
            receipt with us directly over WhatsApp so we can confirm it — we
            never ask for your card, PIN, or wallet password.
          </Text>
        </Section>

        <Section title="How We Use Your Information">
          <List
            items={[
              "To process, ship, and confirm your orders, including sending you order-status updates.",
              "To respond to questions you send us via WhatsApp, Instagram, Facebook, or our contact form.",
              "To let a guest checkout customer look up their own order using the private link sent after purchase.",
              "To improve the site based on aggregate, non-identifying usage patterns.",
            ]}
          />
        </Section>

        <Section title="Guest Checkout">
          <Text variant="body" className="text-muted">
            If you check out without an account, your order is linked to a
            private, one-time access token instead of a login. This token is
            only usable to view that specific order and cannot be used to
            access anyone else&rsquo;s account or order history.
          </Text>
        </Section>

        <Section title="Sharing Your Information">
          <Text variant="body" className="text-muted">
            We do not sell or rent your personal information. We share it
            only where necessary to fulfil your order — for example, with the
            courier delivering your package — or where required by law.
          </Text>
        </Section>

        <Section title="Data Retention">
          <Text variant="body" className="text-muted">
            We keep order and account information for as long as needed to
            fulfil orders, handle returns or disputes, and meet our own
            record-keeping obligations. You can ask us to delete your account
            information at any time (see &ldquo;Your Rights&rdquo; below).
          </Text>
        </Section>

        <Section title="Your Rights">
          <Text variant="body" className="text-muted">
            You can ask us to access, correct, or delete the personal
            information we hold about you by reaching out through our{" "}
            <Link
              href="/contact"
              className="text-primary underline underline-offset-2 hover:text-gold"
            >
              Contact Us
            </Link>{" "}
            page or via WhatsApp. We&rsquo;ll respond as quickly as we can.
          </Text>
        </Section>

        <Section title="Children's Privacy">
          <Text variant="body" className="text-muted">
            Our site is intended for adults placing their own orders. We do
            not knowingly collect information from children.
          </Text>
        </Section>

        <Section title="Changes to This Policy">
          <Text variant="body" className="text-muted">
            We may update this policy from time to time as our services
            change. We&rsquo;ll update the date at the top of this page when
            we do.
          </Text>
        </Section>

        <Section title="Contact Us">
          <Text variant="body" className="text-muted">
            Questions about this policy or your data? Reach us via our{" "}
            <Link
              href="/contact"
              className="text-primary underline underline-offset-2 hover:text-gold"
            >
              Contact Us
            </Link>{" "}
            page or WhatsApp at {siteConfig.mobileWalletNumber}.
          </Text>
        </Section>
      </div>
    </Container>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-beige pt-8">
      <Heading variant="h3" as="h2">
        {title}
      </Heading>
      {children}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 font-body text-base text-muted leading-relaxed">
          <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
