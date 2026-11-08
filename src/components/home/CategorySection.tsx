import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import {
  CategoryCard,
  CategoryCardCircle,
  CategoryCardListRow,
  CategoryCardMinimal,
  CategoryCardTile,
  CategorySpotlightCard,
} from "@/components/home/CategoryCard";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import type { CategoryLayoutId } from "@/types/layoutTemplate";

// Varies each tile's own photo aspect ratio by position so columns settle
// at genuinely different heights. CSS multi-column (`columns-N`) doesn't
// reliably stagger otherwise -- a column-break can land on an item and
// silently drop its margin-top, which is what made an earlier version of
// this layout collapse back into a flat, even grid.
const MASONRY_ASPECTS = ["aspect-square", "aspect-[4/5]", "aspect-[3/4]"];

function distributeIntoColumns<T>(items: T[], columns: number): T[][] {
  const result: T[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, index) => result[index % columns].push(item));
  return result;
}

interface CategorySectionProps {
  categories: Category[];
  /** Which of the admin-selected layout variants to render -- see
   * src/types/layoutTemplate.ts. Defaults to the original "grid" look. */
  layout?: CategoryLayoutId;
}

export function CategorySection({
  categories,
  layout = "grid",
}: CategorySectionProps) {
  return (
    <Section
      id="categories"
      title="Shop By Category"
      subtitle="Find the perfect piece for every occasion, from everyday essentials to bridal statements."
    >
      {layout === "row" && <CategoryRow categories={categories} />}
      {layout === "spotlight" && <CategorySpotlight categories={categories} />}
      {layout === "circles" && <CategoryCircles categories={categories} />}
      {layout === "list" && <CategoryList categories={categories} />}
      {layout === "tiles" && <CategoryTiles categories={categories} />}
      {layout === "masonry" && <CategoryMasonry categories={categories} />}
      {layout === "carousel" && <CategoryCarousel categories={categories} />}
      {layout === "banner" && <CategoryBanner categories={categories} />}
      {layout === "numbered" && <CategoryNumbered categories={categories} />}
      {layout === "quad" && <CategoryQuad categories={categories} />}
      {layout === "grid" && <CategoryGrid categories={categories} />}
    </Section>
  );
}

function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-8">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

function CategoryRow({ categories }: { categories: Category[] }) {
  return (
    <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-6">
      {categories.map((category) => (
        <CategoryCardMinimal
          key={category.id}
          category={category}
          className="w-28 shrink-0 snap-start sm:w-auto"
        />
      ))}
    </div>
  );
}

function CategorySpotlight({ categories }: { categories: Category[] }) {
  const [featured, ...rest] = categories;
  if (!featured) return null;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
      <CategorySpotlightCard
        category={featured}
        className="aspect-[4/3] lg:aspect-auto"
      />
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-2">
        {rest.slice(0, 4).map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}

function CategoryCircles({ categories }: { categories: Category[] }) {
  return (
    <div className="flex snap-x snap-mandatory justify-start gap-5 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible">
      {categories.map((category) => (
        <CategoryCardCircle
          key={category.id}
          category={category}
          className="shrink-0 snap-start"
        />
      ))}
    </div>
  );
}

function CategoryList({ categories }: { categories: Category[] }) {
  return (
    <div className="mx-auto max-w-2xl divide-y divide-beige rounded-2xl border border-beige bg-white px-4 sm:px-6">
      {categories.map((category) => (
        <CategoryCardListRow key={category.id} category={category} />
      ))}
    </div>
  );
}

function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryCardTile key={category.id} category={category} />
      ))}
    </div>
  );
}

function CategoryMasonryColumns({
  categories,
  columns,
  className,
}: {
  categories: Category[];
  columns: number;
  className?: string;
}) {
  const grouped = distributeIntoColumns(categories, columns);
  return (
    <div
      className={cn("grid gap-4", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {grouped.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-4">
          {column.map((category, rowIndex) => (
            <CategoryCard
              key={category.id}
              category={category}
              aspectClassName={
                MASONRY_ASPECTS[(columnIndex + rowIndex) % MASONRY_ASPECTS.length]
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function CategoryMasonry({ categories }: { categories: Category[] }) {
  return (
    <>
      <CategoryMasonryColumns categories={categories} columns={2} className="sm:hidden" />
      <CategoryMasonryColumns
        categories={categories}
        columns={3}
        className="hidden sm:grid lg:hidden"
      />
      <CategoryMasonryColumns categories={categories} columns={4} className="hidden lg:grid" />
    </>
  );
}

function CategoryCarousel({ categories }: { categories: Category[] }) {
  return (
    <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
      {categories.map((category) => (
        <div key={category.id} className="w-32 shrink-0 snap-start sm:w-44">
          <CategoryCard category={category} />
        </div>
      ))}
    </div>
  );
}

function CategoryBanner({ categories }: { categories: Category[] }) {
  return (
    <div className="flex flex-col gap-5">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="group relative flex aspect-[16/7] w-full overflow-hidden rounded-2xl bg-beige shadow-sm transition-all duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:aspect-[21/6]"
        >
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="100vw"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/45 to-transparent"
          />
          <div className="relative flex w-full max-w-md flex-col items-start justify-center gap-2 px-6 sm:px-10">
            <h3 className="font-heading text-2xl font-semibold text-white sm:text-3xl">
              {category.name}
            </h3>
            <span className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-white/90">
              {category.productCount} Products
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function CategoryNumbered({ categories }: { categories: Category[] }) {
  return (
    <div className="mx-auto max-w-2xl divide-y divide-beige rounded-2xl border border-beige bg-white px-4 sm:px-6">
      {categories.map((category, index) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="group flex items-center gap-4 border-b border-beige py-4 transition-colors last:border-b-0 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
        >
          <span className="w-8 shrink-0 font-heading text-2xl font-semibold text-gold/40">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-beige">
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="56px"
              loading="lazy"
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="font-heading text-sm font-semibold text-primary transition-colors group-hover:text-gold">
              {category.name}
            </span>
            <span className="font-body text-xs text-muted">
              {category.productCount} Products
            </span>
          </div>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-gold"
            aria-hidden="true"
          />
        </Link>
      ))}
    </div>
  );
}

function CategoryQuad({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6">
      {categories.slice(0, 4).map((category) => (
        <CategorySpotlightCard
          key={category.id}
          category={category}
          className="aspect-square"
        />
      ))}
    </div>
  );
}
