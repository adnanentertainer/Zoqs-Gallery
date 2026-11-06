import type { Metadata } from "next";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactChannelLink } from "@/components/contact/ContactChannelLink";
import {
  InstagramIcon,
  FacebookIcon,
  WhatsAppIcon,
} from "@/components/icons/social-icons";
import { siteConfig } from "@/constants/site";
import { buildOpenGraph } from "@/lib/utils";

const title = "Contact Us | ZOQ's Gallery";
const description =
  "Get in touch with ZOQ's Gallery over WhatsApp, Instagram, or Facebook.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: buildOpenGraph({ path: "/contact", title, description }),
};

const iconClassName =
  "h-16 w-16 transition-transform duration-200 group-hover:scale-105";

const contactChannels = [
  {
    icon: <WhatsAppIcon className={iconClassName} aria-hidden="true" />,
    title: "WhatsApp",
    detail: siteConfig.mobileWalletNumber,
    href: siteConfig.socialLinks.whatsapp,
    cta: "Chat on WhatsApp",
    isContactChannel: true,
  },
  {
    icon: <InstagramIcon className={iconClassName} aria-hidden="true" />,
    title: "Instagram",
    detail: "@zoqsgallery",
    href: siteConfig.socialLinks.instagram,
    cta: "Follow on Instagram",
  },
  {
    icon: <FacebookIcon className={iconClassName} aria-hidden="true" />,
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {contactChannels.map((channel) => (
          <ContactChannelLink key={channel.title} {...channel} />
        ))}
      </div>

      <div className="mx-auto w-full max-w-xl">
        <ContactForm />
      </div>
    </Container>
  );
}
