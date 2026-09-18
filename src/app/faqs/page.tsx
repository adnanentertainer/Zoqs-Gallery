import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { siteConfig } from "@/constants/site";
import { buildOpenGraph, safeJsonLd } from "@/lib/utils";

const title = "FAQs | ZOQ's Gallery";
const description =
  "Answers to common questions about ordering, payment, shipping, and returns at ZOQ's Gallery.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: buildOpenGraph({ path: "/faqs", title, description }),
};

interface Faq {
  question: string;
  answer: string;
}

interface FaqGroup {
  title: string;
  items: Faq[];
}

const faqGroups: FaqGroup[] = [
  {
    title: "Orders & Payment",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "Cash on Delivery, Bank Transfer, Easypaisa, and JazzCash. You'll pick one at checkout, and for Bank Transfer, Easypaisa, or JazzCash we'll ask you to share your payment receipt over WhatsApp so we can confirm the order.",
      },
      {
        question: "Do I need to create an account to order?",
        answer:
          "No — you can check out as a guest. You'll get a private link to view your order status after checkout. Creating an account just makes it easier to track past orders and check out faster next time.",
      },
      {
        question: "Can I change or cancel my order after placing it?",
        answer:
          "Message us on WhatsApp as soon as possible with your order number. We can usually change or cancel an order before it's shipped, but can't guarantee it once it's already with the courier.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        question: "Do you deliver across Pakistan?",
        answer:
          "Yes, we deliver nationwide. Shipping cost and any free-shipping threshold are shown at checkout based on your order total.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Standard delivery typically takes a few business days, depending on your city and the courier's schedule. You'll get updates on your order status along the way.",
      },
      {
        question: "How do I track my order?",
        answer:
          "If you checked out with an account, you can view your order status from My Account. As a guest, use the private order link we sent you after checkout, or message us on WhatsApp with your order number.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        question: "What's your return policy?",
        answer:
          "If something isn't right, message us on WhatsApp within 7 days of delivery with your order number and photos of the item. Items should be unworn, unused, and in their original packaging.",
      },
      {
        question: "Can I exchange an item for a different color or design?",
        answer:
          "Yes, subject to availability. Reach out on WhatsApp within 7 days of delivery and we'll help you swap it for something else.",
      },
      {
        question: "Who pays for return shipping?",
        answer:
          "If the item arrived damaged or isn't what you ordered, we cover return shipping. For a change-of-mind exchange, the return shipping cost is the customer's responsibility.",
      },
    ],
  },
  {
    title: "Products & Care",
    items: [
      {
        question: "Is your jewellery real gold or silver?",
        answer:
          "Our pieces are artificial (imitation) jewellery — designed to look elegant at an everyday price, not made of precious metals.",
      },
      {
        question: "How do I take care of my jewellery?",
        answer:
          "Keep pieces away from water, perfume, and lotion, and store them in a dry place, ideally in the pouch or box they arrived in, to keep the finish looking new for longer.",
      },
      {
        question: "Will the piece look exactly like the photo?",
        answer:
          "We photograph everything as accurately as we can, but screens and lighting can shift colors slightly. Small variations in shade are normal and not a fault.",
      },
    ],
  },
];

export default function FaqsPage() {
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    ),
  };

  return (
    <Container className="py-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "FAQs" }]} />

      <div className="mx-auto flex max-w-2xl flex-col gap-3 pt-6 text-center">
        <Heading variant="h1" as="h1">
          Frequently Asked Questions
        </Heading>
        <Text variant="body" className="text-muted">
          Can&rsquo;t find what you&rsquo;re looking for? Message us on
          WhatsApp at {siteConfig.mobileWalletNumber} and we&rsquo;ll help
          directly.
        </Text>
      </div>

      <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-10">
        {faqGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-3">
            <Heading variant="h3" as="h2">
              {group.title}
            </Heading>
            <div className="flex flex-col divide-y divide-beige border-y border-beige">
              {group.items.map((item) => (
                <details key={item.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-body text-base font-medium text-primary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                    {item.question}
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <Text variant="body" className="mt-3 text-muted">
                    {item.answer}
                  </Text>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
