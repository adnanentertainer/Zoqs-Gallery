import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Banknote, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { heroImage } from "@/constants/images";
import type { HeroLayoutId } from "@/types/layoutTemplate";

const trustBadges = [
  { icon: Truck, label: "Nationwide Delivery" },
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: ShieldCheck, label: "Authentic Quality" },
];

interface HeroSectionProps {
  /** Which of the admin-selected layout variants to render -- see
   * src/types/layoutTemplate.ts. Defaults to the original "classic" look. */
  layout?: HeroLayoutId;
  /** Overrides the default model photo — passed down when a scheduled
   * promo code currently has a hero banner uploaded for it. See
   * lib/services/promoCodeService.ts's getActiveHeroImage(). */
  imageUrl?: string;
  imageAlt?: string;
}

export function HeroSection({
  layout = "classic",
  imageUrl,
  imageAlt,
}: HeroSectionProps) {
  if (layout === "centered") {
    return <HeroCentered imageUrl={imageUrl} imageAlt={imageAlt} />;
  }
  if (layout === "editorial") {
    return <HeroEditorial imageUrl={imageUrl} imageAlt={imageAlt} />;
  }
  if (layout === "minimal") {
    return <HeroMinimal />;
  }
  if (layout === "panel") {
    return <HeroPanel imageUrl={imageUrl} imageAlt={imageAlt} />;
  }
  if (layout === "badge") {
    return <HeroBadge imageUrl={imageUrl} imageAlt={imageAlt} />;
  }
  return <HeroClassic imageUrl={imageUrl} imageAlt={imageAlt} />;
}

interface HeroVariantProps {
  imageUrl?: string;
  imageAlt?: string;
}

const defaultImageAlt =
  "Bride wearing a gold statement necklace, drop earrings and maang tikka";

function TrustBadges({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={className}>
      {trustBadges.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className={cn(
            "flex items-center gap-2 font-body text-xs font-medium",
            light ? "text-white/80" : "text-muted",
          )}
        >
          <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  );
}

function HeroClassic({ imageUrl, imageAlt }: HeroVariantProps) {
  return (
    <section className="relative flex items-center overflow-hidden bg-secondary lg:min-h-[85vh]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(230,164,33,0.14),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(230,164,33,0.10),transparent_45%)]"
      />

      <Container className="relative grid grid-cols-1 items-center gap-8 py-10 sm:py-14 lg:grid-cols-2 lg:gap-16 lg:py-24">
        {/* Text leads on every breakpoint (order-2 on mobile would otherwise
            push the heading and "Shop" CTA below a full-bleed photo, costing
            a full scroll before a mobile visitor sees any call to action). */}
        {/* Hidden below lg (not just phone-width) to match the grid's own
            single-column-until-lg breakpoint -- showing it again at an
            intermediate tablet width would just cram it above/below the
            text in a narrow column instead of side-by-side. Saves a full
            aspect-[4/5] image's worth of scroll height on every page that
            renders this section on mobile. */}
        <div className="order-2 hidden justify-center lg:flex animate-fade-rise-in-delayed">
          <div className="relative w-full max-w-md">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-3 hidden rounded-2xl border border-gold/25 sm:block"
            />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-[0_25px_60px_-15px_rgba(31,31,31,0.35)] ring-1 ring-gold/30">
              <Image
                src={imageUrl || heroImage}
                alt={imageAlt || defaultImageAlt}
                fill
                preload
                sizes="(max-width: 1024px) 100vw, 448px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="order-1 flex flex-col items-center gap-5 text-center lg:items-start lg:text-left animate-fade-rise-in">
          <span className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Premium Artificial Jewellery
          </span>

          <Heading variant="display" as="h1" className="max-w-md">
            Jewellery That Completes Your Story
          </Heading>

          <Text variant="bodyLg" className="max-w-md text-muted">
            Discover elegant artificial jewellery and fashion accessories
            designed to make every moment beautiful.
          </Text>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="#new-arrivals"
              className={buttonVariants(
                "gold",
                "lg",
                "group transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg",
              )}
            >
              Shop New Arrivals
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="#categories"
              className={buttonVariants(
                "outline-gold",
                "lg",
                "transition-transform duration-200 hover:-translate-y-0.5",
              )}
            >
              Explore Collections
            </Link>
          </div>

          <TrustBadges className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-2 lg:justify-start" />
        </div>
      </Container>
    </section>
  );
}

function HeroCentered({ imageUrl, imageAlt }: HeroVariantProps) {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(230,164,33,0.12),transparent_50%)]"
      />

      <Container className="relative flex flex-col items-center gap-8 py-12 text-center sm:py-16 lg:py-20">
        <div className="flex flex-col items-center gap-5 animate-fade-rise-in">
          <span className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Premium Artificial Jewellery
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </span>

          <Heading variant="display" as="h1" className="max-w-2xl">
            Jewellery That Completes Your Story
          </Heading>

          <Text variant="bodyLg" className="max-w-xl text-muted">
            Discover elegant artificial jewellery and fashion accessories
            designed to make every moment beautiful.
          </Text>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Link
              href="#new-arrivals"
              className={buttonVariants(
                "gold",
                "lg",
                "group transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg",
              )}
            >
              Shop New Arrivals
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="#categories"
              className={buttonVariants(
                "outline-gold",
                "lg",
                "transition-transform duration-200 hover:-translate-y-0.5",
              )}
            >
              Explore Collections
            </Link>
          </div>

          <TrustBadges className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-2" />
        </div>

        <div className="relative w-full animate-fade-rise-in-delayed">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2 hidden rounded-2xl border border-gold/25 sm:block"
          />
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl shadow-[0_25px_60px_-15px_rgba(31,31,31,0.35)] ring-1 ring-gold/30 sm:aspect-[21/8]">
            <Image
              src={imageUrl || heroImage}
              alt={imageAlt || defaultImageAlt}
              fill
              preload
              sizes="100vw"
              className="object-cover [object-position:50%_20%]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

function HeroEditorial({ imageUrl, imageAlt }: HeroVariantProps) {
  return (
    <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-primary lg:min-h-[88vh]">
      <Image
        src={imageUrl || heroImage}
        alt={imageAlt || defaultImageAlt}
        fill
        preload
        sizes="100vw"
        className="object-cover [object-position:60%_20%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/45 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/75 via-primary/15 to-transparent"
      />

      <Container className="relative flex flex-col items-start gap-5 py-12 sm:py-16 lg:py-24 animate-fade-rise-in">
        <span className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
          <span className="h-px w-8 bg-gold" aria-hidden="true" />
          Premium Artificial Jewellery
        </span>

        <Heading variant="display" as="h1" className="max-w-md text-white">
          Jewellery That <em className="italic text-gold">Completes</em> Your
          Story
        </Heading>

        <Text variant="bodyLg" className="max-w-md text-white/85">
          Discover elegant artificial jewellery and fashion accessories
          designed to make every moment beautiful.
        </Text>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <Link
            href="#new-arrivals"
            className={buttonVariants(
              "gold",
              "lg",
              "group transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg",
            )}
          >
            Shop New Arrivals
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="#categories"
            className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-white/70 px-8 font-body text-base font-semibold uppercase tracking-[0.08em] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            Explore Collections
          </Link>
        </div>

        <TrustBadges
          light
          className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2"
        />
      </Container>
    </section>
  );
}

function HeroMinimal() {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(230,164,33,0.12),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-heading text-[28rem] leading-none text-primary/[0.03]"
      >
        Z
      </div>

      <Container className="relative flex flex-col items-center gap-6 py-20 text-center sm:py-28 lg:py-32 animate-fade-rise-in">
        <span className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          <span className="h-px w-10 bg-gold" aria-hidden="true" />
          Premium Artificial Jewellery
          <span className="h-px w-10 bg-gold" aria-hidden="true" />
        </span>

        <Heading variant="display" as="h1" className="max-w-2xl">
          Jewellery That Completes Your Story
        </Heading>

        <Text variant="bodyLg" className="max-w-lg text-muted">
          Discover elegant artificial jewellery and fashion accessories
          designed to make every moment beautiful.
        </Text>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Link
            href="#new-arrivals"
            className={buttonVariants(
              "gold",
              "lg",
              "group transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg",
            )}
          >
            Shop New Arrivals
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="#categories"
            className={buttonVariants(
              "outline-gold",
              "lg",
              "transition-transform duration-200 hover:-translate-y-0.5",
            )}
          >
            Explore Collections
          </Link>
        </div>

        <TrustBadges className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-4" />
      </Container>
    </section>
  );
}

function HeroPanel({ imageUrl, imageAlt }: HeroVariantProps) {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="flex flex-col lg:min-h-[80vh] lg:flex-row">
        <div className="relative order-1 aspect-[4/3] w-full sm:aspect-[16/9] lg:order-2 lg:aspect-auto lg:w-[45%]">
          <Image
            src={imageUrl || heroImage}
            alt={imageAlt || defaultImageAlt}
            fill
            preload
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        </div>

        <div className="order-2 flex flex-1 flex-col items-center justify-center gap-5 px-4 py-10 text-center sm:px-6 lg:order-1 lg:items-start lg:px-16 lg:text-left animate-fade-rise-in">
          <span className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Premium Artificial Jewellery
          </span>

          <Heading variant="display" as="h1" className="max-w-md">
            Jewellery That Completes Your Story
          </Heading>

          <Text variant="bodyLg" className="max-w-md text-muted">
            Discover elegant artificial jewellery and fashion accessories
            designed to make every moment beautiful.
          </Text>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="#new-arrivals"
              className={buttonVariants(
                "gold",
                "lg",
                "group transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg",
              )}
            >
              Shop New Arrivals
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="#categories"
              className={buttonVariants(
                "outline-gold",
                "lg",
                "transition-transform duration-200 hover:-translate-y-0.5",
              )}
            >
              Explore Collections
            </Link>
          </div>

          <TrustBadges className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-2 lg:justify-start" />
        </div>
      </div>
    </section>
  );
}

function HeroBadge({ imageUrl, imageAlt }: HeroVariantProps) {
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-primary lg:min-h-[85vh]">
      <Image
        src={imageUrl || heroImage}
        alt={imageAlt || defaultImageAlt}
        fill
        preload
        sizes="100vw"
        className="object-cover [object-position:65%_20%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent"
      />

      <Container className="relative flex h-full min-h-[70vh] items-end py-8 sm:py-10 lg:min-h-[85vh] lg:py-14">
        <div className="w-full max-w-md rounded-2xl bg-white/95 p-6 shadow-[0_25px_60px_-15px_rgba(31,31,31,0.35)] backdrop-blur sm:p-8 animate-fade-rise-in">
          <span className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Premium Artificial Jewellery
          </span>

          <Heading variant="h1" as="h1" className="mt-3">
            Jewellery That Completes Your Story
          </Heading>

          <Text variant="body" className="mt-2 text-muted">
            Discover elegant artificial jewellery and fashion accessories
            designed to make every moment beautiful.
          </Text>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#new-arrivals"
              className={buttonVariants(
                "gold",
                "md",
                "group transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg",
              )}
            >
              Shop New Arrivals
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="#categories"
              className={buttonVariants(
                "outline-gold",
                "md",
                "transition-transform duration-200 hover:-translate-y-0.5",
              )}
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
