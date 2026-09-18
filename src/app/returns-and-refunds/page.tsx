import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Returns & Refunds | ZOQ's Gallery",
  description:
    "Our return, exchange, and refund policy for orders placed with ZOQ's Gallery.",
  robots: { index: false, follow: true },
};

const LAST_UPDATED = "18 September 2026";

export default function ReturnsAndRefundsPage() {
  return (
    <Container className="py-10 sm:py-16">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Returns & Refunds" },
        ]}
      />

      <div className="mx-auto flex max-w-3xl flex-col gap-8 pt-6">
        <div className="flex flex-col gap-2">
          <Heading variant="h1" as="h1">
            Returns &amp; Refunds
          </Heading>
          <Text variant="bodySm" className="text-muted">
            Last updated {LAST_UPDATED}
          </Text>
        </div>

        <Text variant="body" className="text-muted">
          Customer satisfaction matters to us. Please read this Return &amp;
          Refund Policy before placing an order so you know exactly what to
          expect if something isn&rsquo;t right.
        </Text>

        <Section title="Returns">
          <Text variant="body" className="text-muted">
            We accept returns within <strong>7 days</strong> of the delivery
            date. To qualify, an item must be unworn, unused, and in its
            original condition, with all packaging and accessories included
            and no signs of wear or damage.
          </Text>
          <Text variant="body" className="text-muted">
            To start a return, message us on WhatsApp at{" "}
            {siteConfig.mobileWalletNumber} with your order number and the
            reason for the return.
          </Text>
        </Section>

        <Section title="Exchanges">
          <Text variant="body" className="text-muted">
            Want a different color or design instead? Reach out on WhatsApp
            within 7 days of delivery and we&rsquo;ll help you swap it for
            something else, subject to availability.
          </Text>
        </Section>

        <Section title="Non-Returnable Items">
          <List
            items={[
              "Products damaged through misuse, poor handling, or ordinary wear.",
              "Items missing their original packaging or accessories.",
              "Products purchased during clearance or a special sale promotion, unless the item is defective.",
            ]}
          />
        </Section>

        <Section title="Damaged or Incorrect Items">
          <Text variant="body" className="text-muted">
            If your order arrives damaged or isn&rsquo;t what you ordered,
            message us on WhatsApp within 48 hours of delivery with photos of
            the item. We&rsquo;ll review it and arrange a replacement or
            refund.
          </Text>
        </Section>

        <Section title="Refunds">
          <Text variant="body" className="text-muted">
            Once we receive and inspect a returned item, we&rsquo;ll let you
            know whether the refund is approved. Approved refunds are
            processed within 5&ndash;10 business days.
          </Text>
          <Text variant="body" className="text-muted">
            Since we don&rsquo;t collect card details, refunds are sent back
            the same way you paid: cash for Cash on Delivery orders, or a
            transfer to your bank account, Easypaisa, or JazzCash for orders
            paid that way.
          </Text>
        </Section>

        <Section title="Return Shipping">
          <Text variant="body" className="text-muted">
            If the item arrived damaged or isn&rsquo;t what you ordered, we
            cover the return shipping cost. For a change-of-mind exchange or
            return, the return shipping cost is the customer&rsquo;s
            responsibility.
          </Text>
        </Section>

        <Section title="Order Cancellation">
          <Text variant="body" className="text-muted">
            You can cancel an order before it ships by messaging us on
            WhatsApp with your order number. Once an order has been
            dispatched, it follows the standard return process above instead.
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
            Questions about a return, exchange, or refund? Reach us via our{" "}
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
