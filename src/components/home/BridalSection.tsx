import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";
import { bridalBannerImage } from "@/constants/images";
import { cn } from "@/lib/utils";

export function BridalSection() {
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
            className="pointer-events-none absolute -inset-3 hidden rounded-sm border border-gold/25 sm:block"
          />
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-gold/40">
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
        </div>
      </Container>
    </section>
  );
}
