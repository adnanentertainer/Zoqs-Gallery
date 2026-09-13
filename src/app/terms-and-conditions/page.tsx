import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Terms & Conditions | ZOQ's Gallery",
  description: "The terms that apply when you shop with ZOQ's Gallery.",
  robots: { index: false, follow: true },
};

const LAST_UPDATED = "13 September 2026";

export default function TermsAndConditionsPage() {
  return (
    <Container className="py-10 sm:py-16">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Terms & Conditions" },
        ]}
      />

      <div className="mx-auto flex max-w-3xl flex-col gap-8 pt-6">
        <div className="flex flex-col gap-2">
          <Heading variant="h1" as="h1">
            Terms &amp; Conditions
          </Heading>
          <Text variant="bodySm" className="text-muted">
            Last updated {LAST_UPDATED}
          </Text>
        </div>

        <Text variant="body" className="text-muted">
          These terms apply whenever you browse {siteConfig.name} or place an
          order with us. By using this site, you agree to them.
        </Text>

        <Section title="About Our Products">
          <Text variant="body" className="text-muted">
            We sell artificial (imitation) jewellery and fashion accessories.
            Product photos are edited for lighting and may look slightly
            different from the real piece depending on your screen — small
            variations in shade or finish are normal and not a fault.
          </Text>
        </Section>

        <Section title="Pricing & Payment">
          <List
            items={[
              "All prices are listed in Pakistani Rupees (PKR) and can change without notice.",
              "Available payment methods are Cash on Delivery, Bank Transfer, Easypaisa, and JazzCash, shown at checkout.",
              "For Bank Transfer, Easypaisa, and JazzCash, your order is confirmed once we verify the payment receipt you share with us.",
              "Shipping cost and any free-shipping threshold are calculated automatically and shown before you place your order.",
            ]}
          />
        </Section>

        <Section title="Placing an Order">
          <Text variant="body" className="text-muted">
            You can check out with an account or as a guest. Placing an order
            is an offer to buy — we confirm it by processing your order and
            sending a confirmation. We may cancel or delay an order we
            reasonably believe is fraudulent, or if an item turns out to be
            out of stock.
          </Text>
        </Section>

        <Section title="Guest Checkout">
          <Text variant="body" className="text-muted">
            Guest orders are accessed through a private link containing a
            one-time token, sent to you after checkout. Keep that link to
            yourself — anyone with it can view that order&rsquo;s details.
          </Text>
        </Section>

        <Section title="Shipping & Delivery">
          <Text variant="body" className="text-muted">
            We deliver nationwide across Pakistan. Delivery timeframes shown
            on the site are estimates, not guarantees — delays can happen with
            courier partners, especially in remote areas or during peak
            seasons.
          </Text>
        </Section>

        <Section title="Returns & Exchanges">
          <Text variant="body" className="text-muted">
            See our{" "}
            <Link
              href="/faqs"
              className="text-primary underline underline-offset-2 hover:text-gold"
            >
              FAQs
            </Link>{" "}
            page for our current returns and exchange policy. To start a
            return, message us on WhatsApp with your order number.
          </Text>
        </Section>

        <Section title="Intellectual Property">
          <Text variant="body" className="text-muted">
            All product photos, text, and branding on this site belong to{" "}
            {siteConfig.name}. Please don&rsquo;t reuse them without our
            permission.
          </Text>
        </Section>

        <Section title="Limitation of Liability">
          <Text variant="body" className="text-muted">
            We work hard to describe our products accurately, but we
            aren&rsquo;t liable for indirect or incidental losses arising from
            your use of this site or your order, beyond the value of the
            order itself.
          </Text>
        </Section>

        <Section title="Governing Law">
          <Text variant="body" className="text-muted">
            These terms are governed by the laws of Pakistan.
          </Text>
        </Section>

        <Section title="Changes to These Terms">
          <Text variant="body" className="text-muted">
            We may update these terms as our business changes. Continuing to
            use the site after an update means you accept the revised terms.
          </Text>
        </Section>

        <Section title="Contact Us">
          <Text variant="body" className="text-muted">
            Questions about these terms? Reach us via our{" "}
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
