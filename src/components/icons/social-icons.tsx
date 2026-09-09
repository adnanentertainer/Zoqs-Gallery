import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps: IconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M14 8.5h2V5h-2a3.5 3.5 0 0 0-3.5 3.5V11H8v3h2.5v6H14v-6h2.2l.4-3H14V8.9c0-.3.2-.4.4-.4Z" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5c.36 0 .7.05 1 .14" />
      <path d="M14 4c0 2.5 2 4.5 4.5 4.5" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6.5 17.5 5 20l2.6-1.4A7.5 7.5 0 1 0 5.5 15.9Z" />
      <path d="M9 9.8c0 3 2.4 5.4 5.4 5.4.6 0 1-.5.9-1.1l-.2-.9a.9.9 0 0 0-.9-.7l-1.1.1a4 4 0 0 1-2.6-2.6l.1-1.1a.9.9 0 0 0-.7-.9l-.9-.2c-.6-.1-1.1.3-1.1.9Z" />
    </svg>
  );
}
