"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterPanelContent } from "@/components/filters/FilterPanelContent";
import { buildFilterSearchParams, parseFilterValues } from "@/lib/products";
import { buildUrl } from "@/lib/utils";
import type { FilterValues } from "@/types";

interface FilterSidebarProps {
  showCategoryFilter?: boolean;
}

export function FilterSidebar({
  showCategoryFilter = true,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const values = parseFilterValues(searchParams);

  function handleChange(next: FilterValues) {
    const params = buildFilterSearchParams(next, {
      sort: searchParams.get("sort") ?? undefined,
    });
    router.push(buildUrl(pathname, params), { scroll: false });
  }

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <FilterPanelContent
        values={values}
        onChange={handleChange}
        idPrefix="desktop"
        showCategoryFilter={showCategoryFilter}
      />
    </aside>
  );
}
