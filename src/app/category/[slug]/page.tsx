import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
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
import { getCategoryBySlug } from "@/lib/services/categoryService";
import { getProductsByCategory } from "@/lib/services/productService";
import {
  filterProducts,
  parseFilterValues,
  parseSortKey,
  sortProducts,
} from "@/lib/products";

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

export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found | ZOQ's Gallery" };
  }

  return {
    title: `${category.name} | ZOQ's Gallery`,
    description: category.description,
    alternates: {
      canonical: `/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/category/[slug]">) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const urlSearchParams = toSearchParams(resolvedSearchParams);

  const filters = parseFilterValues(urlSearchParams);
  const sortKey = parseSortKey(urlSearchParams.get("sort"));
  const categoryProducts = await getProductsByCategory(slug);
  const results = sortProducts(
    filterProducts(categoryProducts, filters),
    sortKey,
  );

  return (
    <>
      <Container className="flex flex-col gap-3 pt-6 pb-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: category.name },
          ]}
        />
      </Container>

      <div className="relative flex h-48 items-center overflow-hidden sm:h-64">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-primary/50" />
        <Container className="relative z-10 flex flex-col items-center gap-2 text-center text-white">
          <Heading variant="h1" as="h1" className="text-white">
            {category.name}
          </Heading>
          <Text variant="body" className="max-w-xl text-white/90">
            {category.description}
          </Text>
        </Container>
      </div>

      <Container className="flex flex-col gap-8 py-10 lg:flex-row lg:items-start">
        <FilterSidebar showCategoryFilter={false} />

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <MobileFilterButton showCategoryFilter={false} />
              <SearchTrigger className="border border-beige" />
            </div>
            <SortDropdown />
          </div>

          <ProductResults
            key={urlSearchParams.toString()}
            products={results}
            clearFiltersHref={`/category/${slug}`}
          />
        </div>
      </Container>
    </>
  );
}
