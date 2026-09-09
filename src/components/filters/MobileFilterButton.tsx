"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FilterPanelContent } from "@/components/filters/FilterPanelContent";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  buildFilterSearchParams,
  createEmptyFilterValues,
  hasActiveFilters,
  parseFilterValues,
} from "@/lib/products";
import { buildUrl, cn } from "@/lib/utils";
import type { FilterValues } from "@/types";

interface MobileFilterButtonProps {
  showCategoryFilter?: boolean;
}

export function MobileFilterButton({
  showCategoryFilter = true,
}: MobileFilterButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<FilterValues>(() =>
    parseFilterValues(searchParams),
  );

  useEscapeKey(isOpen, () => setIsOpen(false));
  useBodyScrollLock(isOpen);

  function openDrawer() {
    setDraft(parseFilterValues(searchParams));
    setIsOpen(true);
  }

  function applyFilters() {
    const params = buildFilterSearchParams(draft, {
      sort: searchParams.get("sort") ?? undefined,
    });
    router.push(buildUrl(pathname, params), { scroll: false });
    setIsOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="md"
        onClick={openDrawer}
        className="lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filter
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          !isOpen && "pointer-events-none",
        )}
      >
        <div
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
          className={cn(
            "absolute inset-0 bg-primary/40 transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
          aria-hidden={!isOpen}
          className={cn(
            "absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-lg bg-white shadow-xl transition-transform duration-300 ease-out",
            isOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-beige px-6 py-4">
            <span className="font-heading text-lg font-semibold text-primary">
              Filters
            </span>
            <div className="flex items-center gap-3">
              {hasActiveFilters(draft) && (
                <button
                  type="button"
                  tabIndex={isOpen ? 0 : -1}
                  onClick={() => setDraft(createEmptyFilterValues())}
                  className="rounded-sm font-body text-sm text-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close filters"
                tabIndex={isOpen ? 0 : -1}
                className="rounded-sm p-2 text-primary hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <FilterPanelContent
              values={draft}
              onChange={setDraft}
              idPrefix="mobile"
              showCategoryFilter={showCategoryFilter}
              showHeader={false}
            />
          </div>

          <div className="border-t border-beige px-6 py-4">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              onClick={applyFilters}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
