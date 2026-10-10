import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProductResults } from "@/components/product";
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
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Best Sellers" }]}
        title="Best Sellers"
        subtitle="Loved and worn again and again by ZOQ's Gallery customers."
      />

      <Container className="pb-16">
        <ProductResults
          products={products}
          emptyTitle="No best sellers yet"
          emptyDescription="Check back soon -- we're always tracking what customers love most."
          emptyActionLabel="Browse All Products"
          emptyActionHref="/shop"
        />
      </Container>
    </>
  );
}
