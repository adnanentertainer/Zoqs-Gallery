import type { Metadata } from "next";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { EmptyState, ProductResults } from "@/components/product";
import { getProducts } from "@/lib/services/productService";
import { searchProducts } from "@/lib/products";

function getQuery(
  resolved: Record<string, string | string[] | undefined>,
): string {
  return typeof resolved.q === "string" ? resolved.q.trim() : "";
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/search">): Promise<Metadata> {
  const query = getQuery(await searchParams);
  return {
    title: query
      ? `Search results for "${query}" | ZOQ's Gallery`
      : "Search | ZOQ's Gallery",
    description:
      "Search ZOQ's Gallery for jewellery, categories, materials and more.",
  };
}

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const query = getQuery(await searchParams);
  const allProducts = query ? await getProducts() : [];
  const results = query ? searchProducts(allProducts, query) : [];

  return (
    <Container className="flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-3">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Search" }]}
        />
        <Heading variant="h1" as="h1">
          Search Results
        </Heading>
        {query ? (
          <Text variant="body" className="text-muted">
            {results.length} {results.length === 1 ? "result" : "results"} for
            &ldquo;{query}&rdquo;
          </Text>
        ) : (
          <Text variant="body" className="text-muted">
            Enter a search term to find jewellery and accessories.
          </Text>
        )}
      </div>

      {query ? (
        <ProductResults
          key={query}
          products={results}
          emptyTitle="No jewellery found"
          emptyDescription={`We couldn't find anything for "${query}". Try a different search term.`}
          clearFiltersHref="/shop"
        />
      ) : (
        <EmptyState
          title="Start your search"
          description="Try searching for a product, category, material or occasion."
        />
      )}
    </Container>
  );
}
