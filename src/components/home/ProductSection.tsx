import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
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
    <Section id={id} title={title} subtitle={subtitle} background={background}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-10 flex justify-center sm:mt-12">
        <Link href={viewAllHref} className={buttonVariants("outline", "lg")}>
          {viewAllLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </Section>
  );
}
