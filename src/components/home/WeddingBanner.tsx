import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";
import { galleryImages } from "@/constants/images";
import { SparkleOverlay } from "@/components/shared/SparkleOverlay";
import { cn } from "@/lib/utils";

interface WeddingBannerProps {
  /** Overrides the default jewellery photo — set from Admin → Settings →
   * Wedding Season Promotion. Falls back to the built-in default when empty. */
  imageUrl?: string;
  imageAlt?: string;
}

/** The Wedding Season homepage banner — ivory background with champagne
 * gold and maroon accents, toggled on/off via the "Wedding Season
 * Promotion" setting in Admin → Settings. Copy is fixed, not admin-editable
 * (unlike PromoBannerCarousel), since it's a seasonal brand moment rather
 * than a scheduled sale; the image is admin-uploadable. */
export function WeddingBanner({ imageUrl, imageAlt }: WeddingBannerProps) {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(110,20,35,0.07),transparent_50%),radial-gradient(circle_at_8%_95%,rgba(138,106,36,0.12),transparent_50%)]"
      />

      <Container className="relative grid grid-cols-1 items-center gap-10 py-14 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="relative mx-auto w-full max-w-md lg:mx-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 hidden rounded-2xl border border-maroon/20 sm:block"
          />
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-[0_25px_60px_-15px_rgba(31,31,31,0.3)] ring-1 ring-gold/30">
            <Image
              src={imageUrl || galleryImages.traditionalGoldSet}
              alt={
                imageAlt ||
                "Traditional gold-tone wedding jewellery set with a matching necklace, earrings and bangles"
              }
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 448px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
          <span className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.2em] text-maroon">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Wedding Season
          </span>
          <div className="relative inline-block">
            <Heading variant="h1" as="h2" className="max-w-md">
              The Wedding Edit
            </Heading>
            <SparkleOverlay size="lg" />
          </div>
          <Text variant="bodyLg" className="max-w-md text-muted">
            Beautiful jewellery for your most memorable celebrations.
          </Text>
          <Link
            href="/wedding-collection"
            className={cn(
              buttonVariants("gold", "lg"),
              "group transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg",
            )}
          >
            Shop Wedding Jewellery
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
