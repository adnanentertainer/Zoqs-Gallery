import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Heading, Text } from "@/components/ui/Typography";
import { RatingStars } from "@/components/shared/RatingStars";
import { ProductCard } from "@/components/product/ProductCard";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import type { ProductLayoutId } from "@/types/layoutTemplate";

function distributeIntoColumns<T>(items: T[], columns: number): T[][] {
  const result: T[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, index) => result[index % columns].push(item));
  return result;
}

interface ProductSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLabel: string;
  viewAllHref: string;
  background?: "white" | "cream" | "beige";
  /** Which of the admin-selected layout variants to render -- see
   * src/types/layoutTemplate.ts. Defaults to the original "grid" look. */
  layout?: ProductLayoutId;
}

export function ProductSection({
  id,
  title,
  subtitle,
  products,
  viewAllLabel,
  viewAllHref,
  background = "white",
  layout = "grid",
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

      {layout === "carousel" && (
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {layout === "featured" && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={index === 0 ? "col-span-2" : undefined}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {layout === "compact" && (
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {layout === "duo" && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={index < 2 ? "col-span-2" : undefined}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {layout === "grid" && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {layout === "masonry" && (
        <>
          <ProductMasonryColumns products={products} columns={2} className="sm:hidden" />
          <ProductMasonryColumns
            products={products}
            columns={3}
            className="hidden sm:grid lg:hidden"
          />
          <ProductMasonryColumns products={products} columns={4} className="hidden lg:grid" />
        </>
      )}

      {layout === "list" && (
        <div className="mx-auto flex max-w-2xl flex-col divide-y divide-beige">
          {products.map((product) => (
            <ProductListRow key={product.id} product={product} />
          ))}
        </div>
      )}

      {layout === "spotlight" && products[0] && (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="lg:w-2/5 lg:shrink-0">
            <ProductCard product={products[0]} />
          </div>
          <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
            {products.slice(1, 7).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {layout === "banner" && products[0] && (
        <div className="flex flex-col gap-8">
          <ProductBannerTile product={products[0]} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.slice(1).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {layout === "wide" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {products.map((product) => (
            <ProductWideCard key={product.id} product={product} />
          ))}
        </div>
      )}

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

/** Horizontal row -- thumbnail left, name/rating/price right -- used by the
 * "list" product layout. */
/** Explicit per-column stacks (not CSS `columns-N`) -- a column-break
 * landing on an item silently drops its margin, which previously collapsed
 * this layout back into a flat, even grid. Alternating each column's own
 * top offset staggers them reliably regardless of card content length. */
function ProductMasonryColumns({
  products,
  columns,
  className,
}: {
  products: Product[];
  columns: number;
  className?: string;
}) {
  const grouped = distributeIntoColumns(products, columns);
  return (
    <div
      className={cn("grid gap-4", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {grouped.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className={cn("flex flex-col gap-6", columnIndex % 2 === 1 && "mt-8")}
        >
          {column.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ))}
    </div>
  );
}

function ProductListRow({ product }: { product: Product }) {
  const [primaryImage] = product.images;
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex items-center gap-4 py-4 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-beige">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="80px"
          loading="lazy"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="line-clamp-1 font-body text-sm font-medium text-primary transition-colors group-hover:text-gold">
          {product.name}
        </span>
        <RatingStars rating={product.rating} starClassName="h-3.5 w-3.5" />
        <span className="font-body text-sm font-semibold text-primary">
          {formatPrice(product.price)}
        </span>
      </div>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-gold"
        aria-hidden="true"
      />
    </Link>
  );
}

/** Wide, full-bleed hero banner for a single featured product -- used by the
 * "banner" product layout. */
function ProductBannerTile({ product }: { product: Product }) {
  const [primaryImage] = product.images;
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex aspect-[21/9] w-full overflow-hidden rounded-2xl bg-beige shadow-sm transition-all duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:aspect-[21/7]"
    >
      <Image
        src={primaryImage}
        alt={product.name}
        fill
        sizes="100vw"
        loading="lazy"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/55 to-transparent"
      />
      <div className="relative flex w-full max-w-sm flex-col items-start justify-center gap-2 px-6 sm:px-10">
        <h3 className="font-heading text-xl font-semibold text-white sm:text-2xl">
          {product.name}
        </h3>
        <span className="font-body text-base font-semibold text-white">
          {formatPrice(product.price)}
        </span>
      </div>
    </Link>
  );
}

/** Landscape-oriented card (wider than the usual 3:4 portrait) -- used by
 * the "wide" product layout. */
function ProductWideCard({ product }: { product: Product }) {
  const [primaryImage] = product.images;
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex overflow-hidden rounded-2xl border border-beige bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
    >
      <div className="relative aspect-square w-32 shrink-0 overflow-hidden bg-beige sm:w-40">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 128px, 160px"
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1.5 p-4">
        <span className="line-clamp-2 font-body text-sm font-medium text-primary transition-colors group-hover:text-gold">
          {product.name}
        </span>
        <RatingStars rating={product.rating} starClassName="h-3.5 w-3.5" />
        <span className="font-body text-sm font-semibold text-primary">
          {formatPrice(product.price)}
        </span>
      </div>
    </Link>
  );
}
