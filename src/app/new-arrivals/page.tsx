import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProductResults } from "@/components/product";
import { getNewArrivals } from "@/lib/services/productService";
import { buildOpenGraph } from "@/lib/utils";

const title = "New Arrivals | ZOQ's Gallery";
const description =
  "Fresh styles, just added to the collection -- shop the newest artificial jewellery at ZOQ's Gallery.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/new-arrivals",
  },
  openGraph: buildOpenGraph({ path: "/new-arrivals", title, description }),
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals();

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "New Arrivals" }]}
        title="New Arrivals"
        subtitle="Fresh styles, just added to the collection."
      />

      <Container className="pb-16">
        <ProductResults
          products={products}
          emptyTitle="No new arrivals right now"
          emptyDescription="Check back soon -- we're always adding fresh styles."
          emptyActionLabel="Browse All Products"
          emptyActionHref="/shop"
        />
      </Container>
    </>
  );
}
