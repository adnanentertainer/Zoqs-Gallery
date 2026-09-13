import Image from "next/image";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { Container } from "@/components/ui/Container";
import { footerColumns } from "@/constants/footer";
import { siteConfig } from "@/constants/site";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/icons/social-icons";

interface SocialLink {
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const socialLinks: SocialLink[] = [
  {
    label: "Instagram",
    href: siteConfig.socialLinks.instagram,
    Icon: InstagramIcon,
  },
  {
    label: "Facebook",
    href: siteConfig.socialLinks.facebook,
    Icon: FacebookIcon,
  },
  { label: "TikTok", href: siteConfig.socialLinks.tiktok, Icon: TikTokIcon },
  {
    label: "WhatsApp",
    href: siteConfig.socialLinks.whatsapp,
    Icon: WhatsAppIcon,
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-beige bg-secondary">
      <Container className="py-12 sm:py-16 lg:py-20">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-6 border-b border-beige pb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-full"
            />
            <div>
              <span className="font-heading text-2xl font-semibold text-primary">
                {siteConfig.name}
              </span>
              <p className="mt-2 max-w-md font-body text-sm text-muted">
                {siteConfig.tagline}
              </p>
            </div>
          </div>

          <Image
            src="/logo-full.png"
            alt={`${siteConfig.name} - ${siteConfig.tagline}`}
            width={640}
            height={640}
            className="hidden h-36 w-36 shrink-0 rounded-full sm:block sm:h-44 sm:w-44 lg:h-56 lg:w-56"
          />
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-primary">
                {column.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-sm font-body text-sm text-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-primary">
              Connect With Us
            </h3>
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-beige text-primary transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-beige">
        <Container className="flex flex-col items-center justify-center gap-1 py-6 text-center">
          <p className="font-body text-xs text-muted">
            &copy; {year} {siteConfig.name}. All Rights Reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
