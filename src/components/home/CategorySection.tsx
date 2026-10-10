import { Section } from "@/components/ui/Section";
import { CategoryCard } from "@/components/home/CategoryCard";
import type { Category } from "@/types";

interface CategorySectionProps {
  categories: Category[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <Section
      id="categories"
      title="Shop By Category"
      subtitle="Find the perfect piece for every occasion, from everyday essentials to bridal statements."
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-8">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </Section>
  );
}
