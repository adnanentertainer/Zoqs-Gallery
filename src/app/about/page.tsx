import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Gem, MapPin, ShieldCheck } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading, Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";
import { galleryImages } from "@/constants/images";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "About Us | ZOQ's Gallery",
  description:
    "ZOQ's Gallery brings premium artificial jewellery and fashion accessories to women across Pakistan, at prices that make elegance an everyday thing.",
};

interface Pillar {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

const pillars: Pillar[] = [
  {
    icon: Gem,
    title: "Thoughtfully Designed",
    description:
      "Every piece is chosen for its detail and finish, made to be worn often, not saved for someday.",
  },
  {
    icon: MapPin,
    title: "Proudly Pakistani",
    description:
      "Built for women across Pakistan, with nationwide delivery and Cash on Delivery on every order.",
  },
  {
    icon: ShieldCheck,
    title: "Customer First",
    description:
      "Real support over WhatsApp and Instagram, easy returns, and a team that actually responds.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Container className="flex flex-col gap-10 py-10 sm:gap-16 sm:py-16">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "About Us" }]}
        />

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4 text-center lg:text-left">
            <Text
              variant="caption"
              className="justify-center text-gold lg:justify-start"
            >
              {siteConfig.tagline}
            </Text>
            <Heading variant="h1" as="h1">
              About {siteConfig.name}
            </Heading>
            <Text variant="bodyLg" className="text-muted">
              {siteConfig.name} started with a simple idea: beautifully
              crafted jewellery shouldn&rsquo;t come with a luxury price tag.
              We bring premium artificial jewellery and fashion accessories
              to women across Pakistan &mdash; pieces made to be worn, loved,
              and worn again.
            </Text>
            <div className="mt-2 flex justify-center lg:justify-start">
              <Link href="/shop" className={buttonVariants("primary", "lg")}>
                Shop the Collection
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
            <Image
              src={galleryImages.modelWearingNecklace}
              alt="Woman wearing a delicate layered necklace from ZOQ's Gallery"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </Container>

      <Section background="cream">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 text-center"
            >
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-gold">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <Heading variant="h3" as="h3" className="text-lg">
                {title}
              </Heading>
              <Text variant="bodySm" className="text-muted">
                {description}
              </Text>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
