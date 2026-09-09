import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { ContactForm } from "@/components/contact/ContactForm";
import { InstagramIcon, FacebookIcon } from "@/components/icons/social-icons";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Contact Us | ZOQ's Gallery",
  description:
    "Get in touch with ZOQ's Gallery over WhatsApp, Instagram, or Facebook.",
};

const contactChannels = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    detail: siteConfig.mobileWalletNumber,
    href: siteConfig.socialLinks.whatsapp,
    cta: "Chat on WhatsApp",
  },
  {
    icon: InstagramIcon,
    title: "Instagram",
    detail: "@zoqsgallery",
    href: siteConfig.socialLinks.instagram,
    cta: "Follow on Instagram",
  },
  {
    icon: FacebookIcon,
    title: "Facebook",
    detail: "ZOQ's Gallery",
    href: siteConfig.socialLinks.facebook,
    cta: "Visit our Page",
  },
];

export default function ContactPage() {
  return (
    <Container className="flex flex-col gap-10 py-10">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
      />

      <div className="flex flex-col items-center gap-3 text-center">
        <Heading variant="h1" as="h1">
          We&rsquo;d Love to Hear From You
        </Heading>
        <Text variant="body" className="max-w-md text-muted">
          Questions about an order, a piece you&rsquo;re eyeing, or anything
          else — reach out and we&rsquo;ll get back to you.
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {contactChannels.map(({ icon: Icon, title, detail, href, cta }) => (
          <a
            key={title}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 rounded-sm border border-beige bg-white p-6 text-center transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-gold">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-body text-sm font-semibold text-primary">
              {title}
            </span>
            <span className="font-body text-sm text-muted">{detail}</span>
            <span className="font-body text-xs font-medium text-gold">
              {cta}
            </span>
          </a>
        ))}
      </div>

      <div className="mx-auto w-full max-w-xl">
        <ContactForm />
      </div>
    </Container>
  );
}
