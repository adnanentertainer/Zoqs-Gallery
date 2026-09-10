import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";
import { heroImage } from "@/constants/images";

export function HeroSection() {
  return (
    <section className="bg-secondary">
      <Container className="grid grid-cols-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="relative order-1 aspect-[4/5] w-full overflow-hidden rounded-sm lg:order-2">
          <Image
            src={heroImage}
            alt="Elegant woman wearing an elaborate gold statement choker necklace and drop earrings"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="order-2 flex flex-col items-center gap-5 text-center lg:order-1 lg:items-start lg:text-left">
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
              className={buttonVariants("primary", "lg")}
            >
              Shop New Arrivals
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#categories"
              className={buttonVariants("outline", "lg")}
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
