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
      <circle cx="12" cy="12" r="11" fill="#1a1a1a" />
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
        d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"
        fill="white"
      />
    </svg>
  );
}
