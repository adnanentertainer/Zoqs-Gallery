import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Heading, Text } from "@/components/ui/Typography";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface ProductSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLabel: string;
  viewAllHref: string;
  background?: "white" | "cream" | "beige";
}

export function ProductSection({
  id,
  title,
  subtitle,
  products,
  viewAllLabel,
  viewAllHref,
  background = "white",
}: ProductSectionProps) {
  return (
    <Section id={id} background={background}>
      <div className="mb-10 flex flex-col items-center gap-6 text-center sm:mb-14 sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <Heading variant="h2">{title}</Heading>
          <span aria-hidden="true" className="h-px w-12 bg-gold" />
          {subtitle && (
            <Text variant="bodyLg" className="max-w-xl text-muted">
              {subtitle}
            </Text>
          )}
        </div>
        <Link
          href={viewAllHref}
          className="group hidden shrink-0 items-center gap-2 rounded-sm font-body text-sm font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:inline-flex"
        >
          {viewAllLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-10 flex justify-center sm:hidden">
        <Link
          href={viewAllHref}
          className="group inline-flex items-center gap-2 rounded-sm font-body text-sm font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {viewAllLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </Section>
  );
}
