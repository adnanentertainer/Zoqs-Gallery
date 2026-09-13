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

          <div className="flex flex-col items-center text-center sm:col-span-2 sm:items-end sm:text-right lg:col-span-1">
            <Image
              src="/logo-full.png"
              alt={`${siteConfig.name} - ${siteConfig.tagline}`}
              width={640}
              height={640}
              className="h-40 w-40 shrink-0 rounded-full sm:h-48 sm:w-48 lg:h-56 lg:w-56"
            />
            <span className="mt-3 font-heading text-2xl font-semibold text-primary">
              {siteConfig.name}
            </span>
            <p className="mt-1 whitespace-nowrap font-body text-sm text-muted">
              {siteConfig.tagline}
            </p>
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold text-white transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
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
