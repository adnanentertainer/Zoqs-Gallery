import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Banknote, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";
import { heroImage } from "@/constants/images";

const trustBadges = [
  { icon: Truck, label: "Nationwide Delivery" },
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: ShieldCheck, label: "Authentic Quality" },
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-secondary sm:min-h-[85vh] lg:min-h-[90vh]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(230,164,33,0.14),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(230,164,33,0.10),transparent_45%)]"
      />

      <Container className="relative grid grid-cols-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="order-1 flex justify-center lg:order-2">
          <div className="relative w-full max-w-md">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-3 hidden rounded-sm border border-gold/25 sm:block"
            />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm shadow-[0_25px_60px_-15px_rgba(31,31,31,0.35)] ring-1 ring-gold/30">
              <Image
                src={heroImage}
                alt="Bride wearing a gold statement necklace, drop earrings and maang tikka"
                fill
                preload
                sizes="(max-width: 1024px) 100vw, 448px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="order-2 flex flex-col items-center gap-5 text-center lg:order-1 lg:items-start lg:text-left">
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
                "primary",
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
                "outline",
                "lg",
                "transition-transform duration-200 hover:-translate-y-0.5",
              )}
            >
              Explore Collections
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-2 lg:justify-start">
            {trustBadges.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-2 font-body text-xs font-medium text-muted"
              >
                <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
