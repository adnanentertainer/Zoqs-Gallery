import type { Metadata } from "next";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import {
  FilterSidebar,
  MobileFilterButton,
  SortDropdown,
} from "@/components/filters";
import { SearchTrigger } from "@/components/search";
import { ProductResults } from "@/components/product";
import { getProducts } from "@/lib/services/productService";
import {
  filterProducts,
  parseFilterValues,
  parseSortKey,
  sortProducts,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop All Jewellery | ZOQ's Gallery",
  description:
    "Discover elegant artificial jewellery and fashion accessories designed for every occasion.",
  alternates: {
    // Every ?special=/?category=/?sort= filter combination renders this
    // same route — without this, each becomes a separate indexable "page"
    // in Google's eyes with near-identical content.
    canonical: "/shop",
  },
};

function toSearchParams(
  raw: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && value[0] !== undefined)
      params.set(key, value[0]);
  }
  return params;
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = toSearchParams(resolvedSearchParams);

  const filters = parseFilterValues(urlSearchParams);
  const sortKey = parseSortKey(urlSearchParams.get("sort"));
  const allProducts = await getProducts();
  const results = sortProducts(filterProducts(allProducts, filters), sortKey);

  return (
    <>
      <Container className="flex flex-col gap-3 pt-6 pb-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
        <Heading variant="h1" as="h1">
          Shop All Jewellery
        </Heading>
        <Text variant="body" className="max-w-2xl text-muted">
          Discover elegant artificial jewellery and fashion accessories designed
          for every occasion.
        </Text>
      </Container>

      <Container className="flex flex-col gap-8 pb-16 lg:flex-row lg:items-start">
        <FilterSidebar />

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <MobileFilterButton />
              <SearchTrigger className="border border-beige" />
            </div>
            <SortDropdown />
          </div>

          <ProductResults
            key={urlSearchParams.toString()}
            products={results}
            clearFiltersHref="/shop"
          />
        </div>
      </Container>
    </>
  );
}
