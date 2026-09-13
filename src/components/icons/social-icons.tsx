import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

// Realistic, brand-colored marks (not outline glyphs) -- each icon carries
// its own background shape and colors, matching the real Instagram,
// Facebook, TikTok, and WhatsApp logos rather than a generic monochrome set.

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <defs>
        <linearGradient
          id="instagram-icon-gradient"
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#FFD600" />
          <stop offset="35%" stopColor="#FF7A00" />
          <stop offset="65%" stopColor="#FF0069" />
          <stop offset="100%" stopColor="#D300C5" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="22"
        height="22"
        rx="6"
        fill="url(#instagram-icon-gradient)"
      />
      <rect
        x="6.5"
        y="6.5"
        width="11"
        height="11"
        rx="3.5"
        fill="none"
        stroke="white"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="white" strokeWidth="1.6" />
      <circle cx="17" cy="7" r="1.1" fill="white" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path
        d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.5c0-.9.2-1.5 1.5-1.5h1.6V3.9C16.2 3.9 15.2 3.8 14 3.8c-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3h2.5V21h3.7Z"
        fill="white"
      />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="11" fill="#010101" />
      <path
        d="M15.94 6.02c.32.97 1.09 1.68 2.06 1.88v1.94c-.93-.03-1.86-.23-2.7-.63-.37-.16-.71-.38-1.04-.6-.01 1.88.01 3.76-.01 5.63-.05.9-.35 1.8-.87 2.54-.85 1.24-2.31 2.04-3.81 2.07-.92.05-1.85-.2-2.63-.66-1.3-.77-2.22-2.17-2.35-3.68-.01-.32-.02-.64-.01-.96.12-1.22.72-2.4 1.66-3.2 1.07-.93 2.57-1.37 3.97-1.11.01.95-.03 1.9-.03 2.86-.64-.21-1.39-.15-1.95.24-.4.26-.71.67-.87 1.13-.14.33-.1.69-.09 1.03.15 1.06 1.17 1.94 2.25 1.85.72-.01 1.41-.42 1.78-1.03.13-.22.25-.44.26-.68.07-1.15.04-2.3.05-3.45.01-2.6-.01-5.19.01-7.78h1.35c0 .13.01.26.06.39.32.97 1.09 1.68 2.06 1.88Z"
        fill="white"
      />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="11" fill="#25D366" />
      <path
        d="M6.5 17.5 5 20l2.6-1.4A7.5 7.5 0 1 0 5.5 15.9Z"
        fill="white"
      />
      <path
        d="M9 9.8c0 3 2.4 5.4 5.4 5.4.6 0 1-.5.9-1.1l-.2-.9a.9.9 0 0 0-.9-.7l-1.1.1a4 4 0 0 1-2.6-2.6l.1-1.1a.9.9 0 0 0-.7-.9l-.9-.2c-.6-.1-1.1.3-1.1.9Z"
        fill="#25D366"
      />
    </svg>
  );
}
