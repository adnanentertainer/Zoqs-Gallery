import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
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
import { buildOpenGraph } from "@/lib/utils";

const title = "Shop All Jewellery | ZOQ's Gallery";
const description =
  "Discover elegant artificial jewellery and fashion accessories designed for every occasion.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    // Every ?special=/?category=/?sort= filter combination renders this
    // same route — without this, each becomes a separate indexable "page"
    // in Google's eyes with near-identical content.
    canonical: "/shop",
  },
  openGraph: buildOpenGraph({ path: "/shop", title, description }),
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
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Shop" }]}
        title="Shop All Jewellery"
        subtitle="Discover elegant artificial jewellery and fashion accessories designed for every occasion."
      />

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
