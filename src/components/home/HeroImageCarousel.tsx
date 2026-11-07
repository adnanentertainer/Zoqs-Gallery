"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { HeroImage } from "@/types/heroImage";

const AUTO_ADVANCE_MS = 3000;

interface Slide {
  id: string;
  url: string;
  alt: string;
  fit: "cover" | "contain";
}

interface HeroImageCarouselProps {
  /** Admin-managed carousel slides (Admin → Hero Carousel). Empty when none
   * are configured, or when a scheduled promo code's own hero image should
   * take priority instead -- either way this falls back to a single static
   * photo, so every Hero layout variant keeps working exactly as before. */
  images: HeroImage[];
  fallbackUrl: string;
  fallbackAlt: string;
  sizes: string;
  imageClassName?: string;
  /** This is the mobile-strip instance (Classic Split's "Show hero photo on
   * mobile" toggle). Per slide: if the admin set a `mobileImageUrl`, show
   * that crop filling the frame (object-cover); otherwise fall back to the
   * same desktop `imageUrl`, shown whole with no cropping (object-contain,
   * letterboxed) since it wasn't composed for this frame's aspect ratio. */
  preferMobileImage?: boolean;
}

/** Stacked, crossfading `<Image fill>` layers -- drop-in replacement for a
 * single `<Image fill>` inside an already-positioned (`relative`) hero
 * frame. Auto-advances when there's more than one slide; renders the one
 * photo plainly otherwise, so this never adds rotation where there's
 * nothing to rotate between. */
export function HeroImageCarousel({
  images,
  fallbackUrl,
  fallbackAlt,
  sizes,
  imageClassName,
  preferMobileImage = false,
}: HeroImageCarouselProps) {
  const slides: Slide[] =
    images.length > 0
      ? images.map((image) => {
          const mobileCrop = preferMobileImage ? image.mobileImageUrl : null;
          return {
            id: image.id,
            url: mobileCrop || image.imageUrl,
            alt: image.altText || fallbackAlt,
            fit: mobileCrop ? "cover" : preferMobileImage ? "contain" : "cover",
          };
        })
      : [
          {
            id: "fallback",
            url: fallbackUrl,
            alt: fallbackAlt,
            fit: preferMobileImage ? "contain" : "cover",
          },
        ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <>
      {slides.map((slide, index) => (
        <Image
          key={slide.id}
          src={slide.url}
          alt={slide.alt}
          fill
          preload={index === 0}
          sizes={sizes}
          aria-hidden={index !== activeIndex}
          className={cn(
            imageClassName,
            slide.fit === "contain" ? "object-contain" : "object-cover",
            "transition-opacity duration-1000 ease-in-out",
            index === activeIndex ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </>
  );
}
