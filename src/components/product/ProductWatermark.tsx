import Image from "next/image";

// Branding overlay shown in the bottom-right corner of a product photo (grid
// cards, the main gallery image, quick view, and the full-screen lightbox)
// so a screenshotted or saved copy still reads as ZOQ's Gallery's own.
// Decorative only -- aria-hidden, and pointer-events-none so it never blocks
// a click meant for the image or a button layered near it (e.g. the
// gallery's zoom icon in that same corner).
const SIZE_CLASSES = {
  sm: "bottom-2 right-2 h-6 w-6",
  md: "bottom-3 right-3 h-10 w-10",
  lg: "bottom-4 right-4 h-14 w-14",
} as const;

interface ProductWatermarkProps {
  size?: keyof typeof SIZE_CLASSES;
}

export function ProductWatermark({ size = "sm" }: ProductWatermarkProps) {
  return (
    <Image
      src="/logo-full.png"
      alt=""
      aria-hidden="true"
      width={112}
      height={112}
      className={`pointer-events-none absolute ${SIZE_CLASSES[size]} rounded-full opacity-80 shadow-[0_0_0_1px_rgba(255,255,255,0.4)]`}
    />
  );
}
