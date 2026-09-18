import type { Metadata } from "next";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { ProductCard, EmptyState } from "@/components/product";
import { getBestSellers } from "@/lib/services/productService";
import { buildOpenGraph } from "@/lib/utils";

const title = "Best Sellers | ZOQ's Gallery";
const description =
  "Loved and worn again and again by ZOQ's Gallery customers -- shop our best-selling artificial jewellery.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/best-sellers",
  },
  openGraph: buildOpenGraph({ path: "/best-sellers", title, description }),
};

export default async function BestSellersPage() {
  const products = await getBestSellers();

  return (
    <>
      <Container className="flex flex-col gap-3 pt-6 pb-8">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Best Sellers" }]}
        />
        <Heading variant="h1" as="h1">
          Best Sellers
        </Heading>
        <Text variant="body" className="max-w-2xl text-muted">
          Loved and worn again and again by ZOQ's Gallery customers.
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
            title="No best sellers yet"
            description="Check back soon -- we're always tracking what customers love most."
            actionLabel="Browse All Products"
            actionHref="/products"
          />
        )}
      </Container>
    </>
  );
}
