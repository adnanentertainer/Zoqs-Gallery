import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";
import { bridalBannerImage } from "@/constants/images";
import { cn } from "@/lib/utils";
import type { BridalLayoutId } from "@/types/layoutTemplate";

interface BridalSectionProps {
  /** Which of the admin-selected layout variants to render -- see
   * src/types/layoutTemplate.ts. Defaults to the original "classic" look. */
  layout?: BridalLayoutId;
}

export function BridalSection({ layout = "classic" }: BridalSectionProps) {
  if (layout === "editorial") return <BridalEditorial />;
  if (layout === "quote") return <BridalQuote />;
  if (layout === "side") return <BridalSide />;
  if (layout === "banner") return <BridalBanner />;
  return <BridalClassic />;
}

function BridalCopy() {
  return (
    <>
      <span className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        <span className="h-px w-8 bg-gold" aria-hidden="true" />
        Bridal Collection
      </span>
      <Heading variant="h2" as="h2" className="max-w-md text-white">
        Made for Your Most Beautiful Moments
      </Heading>
      <Text variant="bodyLg" className="max-w-md text-white/80">
        Discover elegant bridal jewellery designed for unforgettable
        celebrations.
      </Text>
      <Link
        href="/category/bridal-jewellery"
        className={cn(
          buttonVariants("gold", "lg"),
          "group transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        )}
      >
        Explore Bridal Collection
        <ArrowRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </>
  );
}

function BridalClassic() {
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(230,164,33,0.14),transparent_50%),radial-gradient(circle_at_10%_90%,rgba(230,164,33,0.10),transparent_50%)]"
      />

      <Container className="relative grid grid-cols-1 items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <div className="relative mx-auto w-full max-w-md lg:mx-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 hidden rounded-2xl border border-gold/25 sm:block"
          />
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-gold/40">
            <Image
              src={bridalBannerImage}
              alt="Bride in a flowing red and gold embroidered lehenga wearing a gold choker necklace, jhumka earrings, maang tikka and bangles"
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 448px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
          <BridalCopy />
        </div>
      </Container>
    </section>
  );
}

function BridalEditorial() {
  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden bg-primary">
      <Image
        src={bridalBannerImage}
        alt="Bride in a flowing red and gold embroidered lehenga wearing a gold choker necklace, jhumka earrings, maang tikka and bangles"
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover [object-position:50%_20%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/60 to-primary/15"
      />

      <Container className="relative flex flex-col items-start gap-5 py-16 sm:py-20 lg:py-28">
        <BridalCopy />
      </Container>
    </section>
  );
}

function BridalQuote() {
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(230,164,33,0.14),transparent_55%)]"
      />

      <Container className="relative flex flex-col items-center gap-6 py-20 text-center sm:py-24 lg:py-28">
        <span className="h-px w-10 bg-gold" aria-hidden="true" />
        <span className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Bridal Collection
        </span>
        <Heading
          variant="display"
          as="h2"
          className="max-w-2xl font-normal italic text-white"
        >
          &ldquo;Made for Your Most Beautiful Moments&rdquo;
        </Heading>
        <Text variant="bodyLg" className="max-w-lg text-white/80">
          Discover elegant bridal jewellery designed for unforgettable
          celebrations.
        </Text>
        <Link
          href="/category/bridal-jewellery"
          className={cn(
            buttonVariants("gold", "lg"),
            "group mt-2 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg",
          )}
        >
          Explore Bridal Collection
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
        <span className="mt-2 h-px w-10 bg-gold" aria-hidden="true" />
      </Container>
    </section>
  );
}

function BridalSide() {
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      <div className="flex flex-col lg:min-h-[60vh] lg:flex-row-reverse">
        <div className="relative order-1 aspect-[4/3] w-full sm:aspect-[16/9] lg:order-2 lg:aspect-auto lg:w-[45%]">
          <Image
            src={bridalBannerImage}
            alt="Bride in a flowing red and gold embroidered lehenga wearing a gold choker necklace, jhumka earrings, maang tikka and bangles"
            fill
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover [object-position:50%_20%]"
          />
        </div>

        <div className="order-2 flex flex-1 flex-col items-center justify-center gap-5 px-4 py-14 text-center sm:px-6 lg:order-1 lg:items-start lg:px-16 lg:text-left">
          <BridalCopy />
        </div>
      </div>
    </section>
  );
}

function BridalBanner() {
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,rgba(230,164,33,0.14),transparent_55%)]"
      />
      <Container className="relative flex flex-col items-center gap-6 py-10 text-center sm:py-12 lg:flex-row lg:justify-between lg:text-left">
        <div className="flex flex-col items-center gap-2 lg:items-start">
          <span className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Bridal Collection
          </span>
          <Heading variant="h3" as="h2" className="max-w-md text-white">
            Made for Your Most Beautiful Moments
          </Heading>
        </div>
        <Link
          href="/category/bridal-jewellery"
          className={cn(
            buttonVariants("gold", "lg"),
            "group shrink-0 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg",
          )}
        >
          Explore Bridal Collection
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </Container>
    </section>
  );
}
