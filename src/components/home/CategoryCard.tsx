import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex w-full flex-col rounded-2xl transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-beige shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-gold">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 144px, (max-width: 1024px) 176px, 192px"
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/10"
        />
      </div>
      <div className="mt-3 flex flex-col items-center gap-0.5 text-center">
        <h3 className="font-heading text-base font-semibold text-primary transition-colors group-hover:text-gold">
          {category.name}
        </h3>
        <span className="font-body text-xs text-muted">
          {category.productCount} Products
        </span>
      </div>
    </Link>
  );
}

/** Flush (no rounding/shadow/ring) square photo with a label + arrow below
 * -- used by the "row" category layout, a tighter/more minimal look than
 * the default rounded grid card. */
export function CategoryCardMinimal({
  category,
  className,
}: CategoryCardProps & { className?: string }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className={cn(
        "group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-beige">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 128px, (max-width: 1024px) 200px, 240px"
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-2.5 flex items-center justify-center gap-1.5">
        <span className="font-heading text-sm font-semibold text-primary transition-colors group-hover:text-gold">
          {category.name}
        </span>
        <ArrowRight
          className="h-3.5 w-3.5 text-gold transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

/** Large tile with the category name overlaid on the photo -- the featured
 * tile in the "spotlight" category layout. */
export function CategorySpotlightCard({
  category,
  className,
}: CategoryCardProps & { className?: string }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className={cn(
        "group relative flex w-full overflow-hidden rounded-2xl bg-beige shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        className,
      )}
    >
      <Image
        src={category.image}
        alt={category.name}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        loading="lazy"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent"
      />
      <div className="relative mt-auto flex w-full items-center justify-between gap-2 p-5 sm:p-7">
        <h3 className="font-heading text-xl font-semibold text-white sm:text-2xl">
          {category.name}
        </h3>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 text-primary transition-colors group-hover:bg-gold group-hover:text-white">
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
