import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Heading, Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";

interface PromotionalBannerProps {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
}

export function PromotionalBanner({
  title,
  description,
  ctaLabel,
  ctaHref,
  image,
  imageAlt,
}: PromotionalBannerProps) {
  return (
    <section className="relative flex min-h-[420px] items-center overflow-hidden sm:min-h-[480px] lg:min-h-[560px]">
      <Image
        src={image}
        alt={imageAlt}
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-primary/45" />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 text-center text-white sm:px-6 lg:items-start lg:px-8 lg:text-left">
        <Heading variant="h2" as="h2" className="max-w-xl text-white">
          {title}
        </Heading>
        <Text variant="bodyLg" className="max-w-lg text-white/90">
          {description}
        </Text>
        <Link href={ctaHref} className={buttonVariants("gold", "lg")}>
          {ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
