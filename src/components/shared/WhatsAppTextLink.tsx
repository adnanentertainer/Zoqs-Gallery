"use client";

import type { ReactNode } from "react";
import { siteConfig } from "@/constants/site";
import { trackContact } from "@/lib/metaPixel";

/** Inline text link to WhatsApp, for policy/FAQ-style copy that mentions
 * WhatsApp mid-sentence rather than as a dedicated button. */
export function WhatsAppTextLink({ children }: { children: ReactNode }) {
  return (
    <a
      href={siteConfig.socialLinks.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackContact()}
      className="text-primary underline underline-offset-2 hover:text-gold"
    >
      {children}
    </a>
  );
}
