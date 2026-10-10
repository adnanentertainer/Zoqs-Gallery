import { Banknote, Gem, ShieldCheck, Truck } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Section } from "@/components/ui/Section";

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
    icon: Truck,
    title: "Nationwide Delivery",
    description: "Beautiful jewellery delivered to your doorstep.",
  },
  {
    icon: Banknote,
    title: "Cash on Delivery",
    description: "Shop with confidence across Pakistan.",
  },
  {
    icon: ShieldCheck,
    title: "Easy Shopping",
    description: "Simple and secure shopping experience.",
  },
];

export function BenefitsSection() {
  return (
    <Section background="cream">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-beige">
        {benefits.map(({ icon: Icon, title, description }, index) => (
          <div
            key={title}
            className={`flex items-center gap-4 ${index > 0 ? "lg:pl-8" : ""}`}
          >
            <Icon
              className="h-7 w-7 shrink-0 text-gold"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div className="flex flex-col gap-0.5">
              <span className="font-heading text-base font-semibold text-primary">
                {title}
              </span>
              <span className="font-body text-sm text-muted">
                {description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
