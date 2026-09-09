import { Banknote, Gem, ShieldCheck, Truck } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Section } from "@/components/ui/Section";
import { Heading, Text } from "@/components/ui/Typography";

interface Benefit {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: Gem,
    title: "Premium Quality",
    description: "Carefully selected jewellery and accessories.",
  },
  {
    icon: Banknote,
    title: "Cash on Delivery",
    description: "Shop with confidence across Pakistan.",
  },
  {
    icon: Truck,
    title: "Nationwide Delivery",
    description: "Beautiful jewellery delivered to your doorstep.",
  },
  {
    icon: ShieldCheck,
    title: "Easy Shopping",
    description: "Simple and secure shopping experience.",
  },
];

export function BenefitsSection() {
  return (
    <Section background="cream" title="Why Choose ZOQ's Gallery">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ icon: Icon, title, description }) => (
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
  );
}
