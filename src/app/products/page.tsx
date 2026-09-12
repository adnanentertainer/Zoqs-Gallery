import type { Metadata } from "next";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { CategoryCard } from "@/components/home/CategoryCard";
import { getCategories } from "@/lib/services/categoryService";

export const metadata: Metadata = {
  title: "Products | ZOQ's Gallery",
  description:
    "Browse our jewellery by category -- earrings, necklaces, bracelets, rings, and more.",
  alternates: {
    canonical: "/products",
  },
};

export default async function ProductsPage() {
  const categories = await getCategories();

  return (
    <>
      <Container className="flex flex-col gap-3 pt-6 pb-8">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Products" }]}
        />
        <Heading variant="h1" as="h1">
          Products
        </Heading>
        <Text variant="body" className="max-w-2xl text-muted">
          Browse by category to find the perfect piece, from everyday
          essentials to bridal statements.
        </Text>
      </Container>

      <Container className="pb-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </Container>
    </>
  );
}
