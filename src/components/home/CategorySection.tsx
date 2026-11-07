import { Section } from "@/components/ui/Section";
import {
  CategoryCard,
  CategoryCardMinimal,
  CategorySpotlightCard,
} from "@/components/home/CategoryCard";
import type { Category } from "@/types";
import type { CategoryLayoutId } from "@/types/layoutTemplate";

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
