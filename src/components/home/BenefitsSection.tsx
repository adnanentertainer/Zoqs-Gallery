import { Banknote, Gem, ShieldCheck, Truck } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import type { BenefitsLayoutId } from "@/types/layoutTemplate";

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

interface BenefitsSectionProps {
  /** Which of the admin-selected layout variants to render -- see
   * src/types/layoutTemplate.ts. Defaults to the original "inline" look. */
  layout?: BenefitsLayoutId;
}

export function BenefitsSection({ layout = "inline" }: BenefitsSectionProps) {
  if (layout === "banner") return <BenefitsBanner />;

  return (
    <Section background="cream">
      {layout === "cards" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 rounded-2xl border border-beige bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10">
                <Icon
                  className="h-6 w-6 text-gold"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </span>
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
      )}

      {layout === "steps" && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="font-heading text-3xl font-semibold text-gold/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-beige" aria-hidden="true" />
                <Icon
                  className="h-5 w-5 shrink-0 text-gold"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>
              <span className="font-heading text-base font-semibold text-primary">
                {title}
              </span>
              <span className="font-body text-sm text-muted">
                {description}
              </span>
            </div>
          ))}
        </div>
      )}

      {layout === "ticker" && (
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {benefits.map(({ icon: Icon, title }) => (
            <div key={title} className="flex items-center gap-2">
              <Icon
                className="h-4 w-4 shrink-0 text-gold"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="font-body text-sm font-medium text-primary">
                {title}
              </span>
            </div>
          ))}
        </div>
      )}

      {layout === "inline" && (
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-beige">
          {benefits.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className={`flex items-center gap-4 ${index > 0 ? "lg:pl-8" : ""}`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10">
                <Icon
                  className="h-6 w-6 text-gold"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </span>
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
      )}
    </Section>
  );
}

function BenefitsBanner() {
  return (
    <section className="bg-primary py-8 sm:py-10">
      <Container className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
        {benefits.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-heading text-sm font-semibold text-white">
                {title}
              </span>
              <span className="font-body text-xs text-white/70">
                {description}
              </span>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
