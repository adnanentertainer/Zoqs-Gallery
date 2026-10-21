import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Container } from "@/components/ui/Container";
import {
  ActiveFilterChips,
  FilterSidebar,
  MobileFilterButton,
  SortDropdown,
} from "@/components/filters";
import { SearchTrigger } from "@/components/search";
import { ProductResults } from "@/components/product";
import { getWeddingPicks } from "@/lib/services/productService";
import {
  filterProducts,
  parseFilterValues,
  parseSortKey,
  sortProducts,
} from "@/lib/products";
import { buildOpenGraph } from "@/lib/utils";

const title = "Wedding Collection | ZOQ's Gallery";
const description =
  "Bridal sets, earrings, bangles, rings and more — jewellery hand-picked for your wedding celebrations at ZOQ's Gallery.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    // Every filter/sort combination renders this same route — without this,
    // each becomes a separate indexable "page" in Google's eyes with
    // near-identical content (same pattern as /shop and /category/[slug]).
    canonical: "/wedding-collection",
  },
  openGraph: buildOpenGraph({
    path: "/wedding-collection",
    title,
    description,
  }),
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

export default async function WeddingCollectionPage({
  searchParams,
}: PageProps<"/wedding-collection">) {
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = toSearchParams(resolvedSearchParams);

  const filters = parseFilterValues(urlSearchParams);
  const sortKey = parseSortKey(urlSearchParams.get("sort"));
  const weddingProducts = await getWeddingPicks();
  const results = sortProducts(
    filterProducts(weddingProducts, filters),
    sortKey,
  );
  const isEmptyCollection = weddingProducts.length === 0;

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Wedding Collection" },
        ]}
        title="Wedding Collection"
        subtitle="Bridal sets, earrings, bangles, rings and more — jewellery hand-picked for your wedding celebrations."
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

          <ActiveFilterChips />

          <ProductResults
            key={urlSearchParams.toString()}
            products={results}
            clearFiltersHref="/wedding-collection"
            emptyTitle={
              isEmptyCollection ? "Wedding Collection coming soon" : undefined
            }
            emptyDescription={
              isEmptyCollection
                ? "We're curating something special for the season — check back soon, or explore our full catalogue."
                : undefined
            }
            emptyActionLabel={
              isEmptyCollection ? "Browse All Products" : undefined
            }
            emptyActionHref={isEmptyCollection ? "/shop" : undefined}
          />
        </div>
      </Container>
    </>
  );
}
