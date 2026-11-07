"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { setPendingPromoCode } from "@/lib/pendingPromo";
import { cn } from "@/lib/utils";
import type { PromoBanner } from "@/types/promoBanner";
import type { PromoBannerLayoutId } from "@/types/layoutTemplate";

const AUTO_ADVANCE_MS = 5000;

function slideHref(banner: PromoBanner): string {
  const link = banner.buttonLink || "/shop";
  if (!banner.promoCode) return link;
  const separator = link.includes("?") ? "&" : "?";
  return `${link}${separator}promo=${encodeURIComponent(banner.promoCode)}`;
}

function PromoTextLabel({
  text,
  light = true,
}: {
  text: string;
  light?: boolean;
}) {
  if (!text) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.2em]",
        light ? "text-gold" : "text-gold",
      )}
    >
      <span className="h-px w-8 bg-gold" aria-hidden="true" />
      {text}
    </span>
  );
}

function PromoCodeBadge({
  code,
  light = true,
}: {
  code: string | null;
  light?: boolean;
}) {
  if (!code) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-sm border border-dashed px-3 py-1.5 font-body text-sm",
        light
          ? "border-gold/60 bg-white/5 text-white"
          : "border-gold/60 bg-black/5 text-primary",
      )}
    >
      <Tag className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
      Use code <span className="font-semibold tracking-wide text-gold">{code}</span>
    </span>
  );
}

function CtaButton({
  banner,
  size = "lg",
  variant = "gold",
}: {
  banner: PromoBanner;
  size?: "md" | "lg";
  variant?: "gold" | "outline-gold";
}) {
  if (!banner.buttonText) return null;
  return (
    <Link
      href={slideHref(banner)}
      onClick={() => {
        if (banner.promoCode) setPendingPromoCode(banner.promoCode);
      }}
      className={cn(
        buttonVariants(variant, size, "group"),
        "transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg",
      )}
    >
      {banner.buttonText}
      <ArrowRight
        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </Link>
  );
}

function RadialGradientBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(230,164,33,0.16),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(230,164,33,0.12),transparent_50%)]"
    />
  );
}

/** Classic Split: text left, a circular photo badge right -- the original look. */
function SlideClassic({ banner }: { banner: PromoBanner }) {
  return (
    <div
      className="relative flex min-h-[300px] items-center overflow-hidden bg-primary sm:min-h-[340px]"
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
      {banner.backgroundImageUrl ? (
        <div
          className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-primary/30"
          aria-hidden="true"
        />
      ) : (
        <RadialGradientBackdrop />
      )}
      <div className="relative mx-auto flex w-full max-w-7xl flex-row items-center justify-between gap-4 px-4 py-8 text-left sm:gap-6 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
        <div className="flex min-w-0 flex-col items-start gap-2 sm:gap-3">
          <PromoTextLabel text={banner.promoText} />
          <h2 className="font-heading text-lg font-semibold text-white sm:text-3xl lg:text-4xl">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="max-w-md font-body text-xs text-white/85 sm:text-base">
              {banner.subtitle}
            </p>
          )}
          <PromoCodeBadge code={banner.promoCode} />
          <div className="mt-1">
            <CtaButton banner={banner} size="md" />
          </div>
        </div>
        {banner.bannerImageUrl && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-white/20 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.45)] sm:h-40 sm:w-40 lg:h-52 lg:w-52">
            <Image
              src={banner.bannerImageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 64px, (max-width: 1024px) 160px, 208px"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Split Reverse: same as Classic Split, mirrored -- photo badge left. */
function SlideSplitReverse({ banner }: { banner: PromoBanner }) {
  return (
    <div
      className="relative flex min-h-[300px] items-center overflow-hidden bg-primary sm:min-h-[340px]"
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
      {banner.backgroundImageUrl ? (
        <div
          className="absolute inset-0 bg-gradient-to-l from-primary/90 via-primary/60 to-primary/30"
          aria-hidden="true"
        />
      ) : (
        <RadialGradientBackdrop />
      )}
      <div className="relative mx-auto flex w-full max-w-7xl flex-row items-center justify-between gap-4 px-4 py-8 text-right sm:gap-6 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
        {banner.bannerImageUrl && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-white/20 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.45)] sm:h-40 sm:w-40 lg:h-52 lg:w-52">
            <Image
              src={banner.bannerImageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 64px, (max-width: 1024px) 160px, 208px"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex min-w-0 flex-col items-end gap-2 sm:gap-3">
          <PromoTextLabel text={banner.promoText} />
          <h2 className="font-heading text-lg font-semibold text-white sm:text-3xl lg:text-4xl">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="max-w-md font-body text-xs text-white/85 sm:text-base">
              {banner.subtitle}
            </p>
          )}
          <PromoCodeBadge code={banner.promoCode} />
          <div className="mt-1">
            <CtaButton banner={banner} size="md" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Full-Bleed Photo: the photo fills the whole banner, text overlaid. */
function SlideFullBleed({ banner }: { banner: PromoBanner }) {
  const photo = banner.backgroundImageUrl || banner.bannerImageUrl;
  return (
    <div className="relative flex min-h-[340px] items-center overflow-hidden bg-primary sm:min-h-[400px]">
      {photo ? (
        <Image
          src={photo}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <RadialGradientBackdrop />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent"
      />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start gap-4 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <PromoTextLabel text={banner.promoText} />
        <h2 className="max-w-lg font-heading text-3xl font-semibold text-white sm:text-4xl">
          {banner.title}
        </h2>
        {banner.subtitle && (
          <p className="max-w-md font-body text-base text-white/85">
            {banner.subtitle}
          </p>
        )}
        <PromoCodeBadge code={banner.promoCode} />
        <div className="mt-1">
          <CtaButton banner={banner} />
        </div>
      </div>
    </div>
  );
}

/** Side Panel: photo bleeds edge-to-edge in a rectangular panel, no circle crop. */
function SlidePanel({ banner }: { banner: PromoBanner }) {
  const photo = banner.bannerImageUrl || banner.backgroundImageUrl;
  return (
    <div className="relative overflow-hidden bg-primary">
      <div className="flex flex-col lg:flex-row lg:min-h-[320px]">
        {photo && (
          <div className="relative aspect-[16/9] w-full lg:aspect-auto lg:w-[42%]">
            <Image src={photo} alt="" fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" />
          </div>
        )}
        <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-6 lg:items-start lg:px-10 lg:py-12 lg:text-left">
          {!photo && <RadialGradientBackdrop />}
          <PromoTextLabel text={banner.promoText} />
          <h2 className="font-heading text-3xl font-semibold text-white sm:text-4xl">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="max-w-md font-body text-base text-white/85">
              {banner.subtitle}
            </p>
          )}
          <PromoCodeBadge code={banner.promoCode} />
          <div className="mt-1">
            <CtaButton banner={banner} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Floating Badge: full-bleed photo with text in a floating card over the corner. */
function SlideBadge({ banner }: { banner: PromoBanner }) {
  const photo = banner.backgroundImageUrl || banner.bannerImageUrl;
  return (
    <div className="relative min-h-[340px] overflow-hidden bg-primary sm:min-h-[380px]">
      {photo ? (
        <Image src={photo} alt="" fill sizes="100vw" className="object-cover" />
      ) : (
        <RadialGradientBackdrop />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
      />
      <div className="relative flex min-h-[340px] items-end px-4 py-6 sm:min-h-[380px] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="w-full max-w-md rounded-2xl bg-white/95 p-6 shadow-[0_25px_60px_-15px_rgba(31,31,31,0.35)] backdrop-blur sm:p-7">
          <PromoTextLabel text={banner.promoText} light={false} />
          <h2 className="mt-2 font-heading text-2xl font-semibold text-primary sm:text-3xl">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="mt-2 font-body text-sm text-muted">
              {banner.subtitle}
            </p>
          )}
          <div className="mt-3">
            <PromoCodeBadge code={banner.promoCode} light={false} />
          </div>
          <div className="mt-4">
            <CtaButton banner={banner} size="md" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Centered Minimal: no photo -- centered text and button on a solid band. */
function SlideCentered({ banner }: { banner: PromoBanner }) {
  return (
    <div className="relative overflow-hidden bg-primary">
      <RadialGradientBackdrop />
      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-4 py-12 text-center sm:px-6 lg:py-14">
        <PromoTextLabel text={banner.promoText} />
        <h2 className="font-heading text-3xl font-semibold text-white sm:text-4xl">
          {banner.title}
        </h2>
        {banner.subtitle && (
          <p className="max-w-md font-body text-base text-white/85">
            {banner.subtitle}
          </p>
        )}
        <PromoCodeBadge code={banner.promoCode} />
        <div className="mt-1">
          <CtaButton banner={banner} />
        </div>
      </div>
    </div>
  );
}

/** Compact Ticker: a short single-row announcement strip, no subtitle. */
function SlideTicker({ banner }: { banner: PromoBanner }) {
  return (
    <div className="relative overflow-hidden bg-primary">
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-3 px-4 py-4 text-center sm:flex-row sm:justify-between sm:px-6 sm:py-5 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
          <PromoTextLabel text={banner.promoText} />
          <h2 className="font-heading text-lg font-semibold text-white sm:text-xl">
            {banner.title}
          </h2>
          <PromoCodeBadge code={banner.promoCode} />
        </div>
        <CtaButton banner={banner} size="md" />
      </div>
    </div>
  );
}

/** Stacked Poster: a wide photo on top, text and button centered beneath it. */
function SlideStacked({ banner }: { banner: PromoBanner }) {
  const photo = banner.bannerImageUrl || banner.backgroundImageUrl;
  return (
    <div className="relative overflow-hidden bg-primary">
      {photo && (
        <div className="relative aspect-[21/9] w-full sm:aspect-[21/7]">
          <Image src={photo} alt="" fill sizes="100vw" className="object-cover" />
        </div>
      )}
      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-3 px-4 py-8 text-center sm:px-6">
        <PromoTextLabel text={banner.promoText} light={false} />
        <h2 className="font-heading text-2xl font-semibold text-white sm:text-3xl">
          {banner.title}
        </h2>
        {banner.subtitle && (
          <p className="max-w-md font-body text-sm text-white/85">
            {banner.subtitle}
          </p>
        )}
        <PromoCodeBadge code={banner.promoCode} />
        <div className="mt-1">
          <CtaButton banner={banner} size="md" />
        </div>
      </div>
    </div>
  );
}

function Slide({
  banner,
  layout,
}: {
  banner: PromoBanner;
  layout: PromoBannerLayoutId;
}) {
  switch (layout) {
    case "splitReverse":
      return <SlideSplitReverse banner={banner} />;
    case "fullBleed":
      return <SlideFullBleed banner={banner} />;
    case "panel":
      return <SlidePanel banner={banner} />;
    case "badge":
      return <SlideBadge banner={banner} />;
    case "centered":
      return <SlideCentered banner={banner} />;
    case "ticker":
      return <SlideTicker banner={banner} />;
    case "stacked":
      return <SlideStacked banner={banner} />;
    default:
      return <SlideClassic banner={banner} />;
  }
}

export function PromoBannerCarousel({
  banners,
  layout = "classic",
}: {
  banners: PromoBanner[];
  layout?: PromoBannerLayoutId;
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
    return <Slide banner={banners[0]} layout={layout} />;
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => (isPausedRef.current = true)}
      onMouseLeave={() => (isPausedRef.current = false)}
      onFocus={() => (isPausedRef.current = true)}
      onBlur={() => (isPausedRef.current = false)}
    >
      <Slide banner={banners[activeIndex]} layout={layout} />

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
