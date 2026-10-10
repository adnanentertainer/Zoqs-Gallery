import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { CategoryCard } from "@/components/home/CategoryCard";
import { getCategories } from "@/lib/services/categoryService";
import { buildOpenGraph } from "@/lib/utils";

const title = "Products | ZOQ's Gallery";
const description =
  "Browse our jewellery by category -- earrings, necklaces, bracelets, rings, and more.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/products",
  },
  openGraph: buildOpenGraph({ path: "/products", title, description }),
};

export default async function ProductsPage() {
  const categories = await getCategories();

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Products" }]}
        title="Products"
        subtitle="Browse by category to find the perfect piece, from everyday essentials to bridal statements."
      />

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
