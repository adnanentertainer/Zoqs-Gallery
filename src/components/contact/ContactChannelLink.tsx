"use client";

import type { ReactNode } from "react";
import { trackContact } from "@/lib/metaPixel";

interface ContactChannelLinkProps {
  // A rendered icon element, not a component reference -- component
  // references can't cross the server/client boundary as props.
  icon: ReactNode;
  title: string;
  detail: string;
  href: string;
  cta: string;
  /** Only the WhatsApp/phone/email channel counts as a Meta "Contact"
   * event -- Instagram/Facebook are a follow, not a contact attempt. */
  isContactChannel?: boolean;
}

export function ContactChannelLink({
  icon,
  title,
  detail,
  href,
  cta,
  isContactChannel,
}: ContactChannelLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={isContactChannel ? () => trackContact() : undefined}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-beige bg-white p-8 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      {icon}
      <span className="font-heading text-lg font-semibold text-primary">
        {title}
      </span>
      <span className="font-body text-sm text-muted">{detail}</span>
      <span className="font-body text-xs font-semibold uppercase tracking-wide text-gold">
        {cta}
      </span>
    </a>
  );
}
