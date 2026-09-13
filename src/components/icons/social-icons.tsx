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
      <path
        d="M20.463 3.488C18.216 1.24 15.231.001 12.05 0 5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654c1.737.947 3.694 1.447 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893.001-3.18-1.235-6.167-3.48-8.413Z"
        fill="#25D366"
      />
      <path
        d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771Zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.129.332.202c.045.072.045.419-.1.824Z"
        fill="white"
      />
    </svg>
  );
}
