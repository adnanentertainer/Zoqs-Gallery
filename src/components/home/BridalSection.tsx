import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";
import { bridalBannerImage } from "@/constants/images";

export function BridalSection() {
  return (
    <section className="bg-primary text-white">
      <Container className="grid grid-cols-1 items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-gold/40">
          <Image
            src={bridalBannerImage}
            alt="Bride wearing an elaborate traditional gold bridal jewellery set with necklace, maang tikka and earrings"
            fill
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
          <span className="font-body text-xs uppercase tracking-[0.2em] text-gold">
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
            className={buttonVariants("gold", "lg")}
          >
            Explore Bridal Collection
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
