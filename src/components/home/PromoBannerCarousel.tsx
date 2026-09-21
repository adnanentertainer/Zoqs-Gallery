"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { setPendingPromoCode } from "@/lib/pendingPromo";
import { cn } from "@/lib/utils";
import type { PromoBanner } from "@/types/promoBanner";

const AUTO_ADVANCE_MS = 5000;

function slideHref(banner: PromoBanner): string {
  const link = banner.buttonLink || "/shop";
  if (!banner.promoCode) return link;
  const separator = link.includes("?") ? "&" : "?";
  return `${link}${separator}promo=${encodeURIComponent(banner.promoCode)}`;
}

function Slide({ banner }: { banner: PromoBanner }) {
  return (
    <div
      className="relative flex min-h-[280px] items-center overflow-hidden bg-primary sm:min-h-[320px]"
      style={
        banner.backgroundImageUrl
          ? {
              backgroundImage: `url(${banner.backgroundImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {banner.backgroundImageUrl && (
        <div className="absolute inset-0 bg-primary/60" aria-hidden="true" />
      )}
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-12 text-center sm:px-6 lg:flex-row lg:justify-between lg:px-8 lg:text-left">
        <div className="flex flex-col items-center gap-3 lg:items-start">
          {banner.promoText && (
            <span className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-gold">
              {banner.promoText}
            </span>
          )}
          <h2 className="font-heading text-2xl font-semibold text-white sm:text-3xl">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="max-w-md font-body text-sm text-white/85">
              {banner.subtitle}
            </p>
          )}
          {banner.promoCode && (
            <span className="rounded-sm border border-white/40 px-3 py-1.5 font-body text-sm font-medium text-white">
              Use code: <span className="font-semibold">{banner.promoCode}</span>
            </span>
          )}
          {banner.buttonText && (
            <Link
              href={slideHref(banner)}
              onClick={() => {
                if (banner.promoCode) setPendingPromoCode(banner.promoCode);
              }}
              className={buttonVariants("gold", "lg", "mt-1")}
            >
              {banner.buttonText}
            </Link>
          )}
        </div>
        {banner.bannerImageUrl && (
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full border-4 border-white/20 sm:h-52 sm:w-52">
            <Image
              src={banner.bannerImageUrl}
              alt=""
              fill
              sizes="208px"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function PromoBannerCarousel({
  banners,
}: {
  banners: PromoBanner[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      if (isPausedRef.current) return;
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 1) {
    return <Slide banner={banners[0]} />;
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => (isPausedRef.current = true)}
      onMouseLeave={() => (isPausedRef.current = false)}
      onFocus={() => (isPausedRef.current = true)}
      onBlur={() => (isPausedRef.current = false)}
    >
      <Slide banner={banners[activeIndex]} />

      <button
        type="button"
        aria-label="Previous promotion"
        onClick={() =>
          setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length)
        }
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:block"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Next promotion"
        onClick={() => setActiveIndex((prev) => (prev + 1) % banners.length)}
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:block"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {banners.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            aria-label={`Show promotion ${index + 1}`}
            aria-current={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === activeIndex ? "w-5 bg-gold" : "bg-white/50",
            )}
          />
        ))}
      </div>
    </div>
  );
}
