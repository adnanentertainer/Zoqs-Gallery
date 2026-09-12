import type { Metadata } from "next";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { ProductCard, EmptyState } from "@/components/product";
import { getNewArrivals } from "@/lib/services/productService";

export const metadata: Metadata = {
  title: "New Arrivals | ZOQ's Gallery",
  description:
    "Fresh styles, just added to the collection -- shop the newest artificial jewellery at ZOQ's Gallery.",
  alternates: {
    canonical: "/new-arrivals",
  },
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals();

  return (
    <>
      <Container className="flex flex-col gap-3 pt-6 pb-8">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "New Arrivals" }]}
        />
        <Heading variant="h1" as="h1">
          New Arrivals
        </Heading>
        <Text variant="body" className="max-w-2xl text-muted">
          Fresh styles, just added to the collection.
        </Text>
      </Container>

      <Container className="pb-16">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No new arrivals right now"
            description="Check back soon -- we're always adding fresh styles."
            actionLabel="Browse All Products"
            actionHref="/products"
          />
        )}
      </Container>
    </>
  );
}
