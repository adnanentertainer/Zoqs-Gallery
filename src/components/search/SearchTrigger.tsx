"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { searchProducts } from "@/lib/products";
import { categoryLabel, cn, formatPrice } from "@/lib/utils";
import { allProducts } from "@/data/products";

const POPULAR_SEARCHES = [
  "Earrings",
  "Bridal",
  "Kundan",
  "Necklace",
  "Bracelet",
];
const RECENT_SEARCHES = ["Necklace", "Rings"];

const iconButtonStyles =
  "items-center justify-center rounded-sm p-2 text-primary transition-colors hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";

function subscribeNoop() {
  return () => {};
}

// The search overlay is portalled to document.body, which doesn't exist
// during SSR — this reports true only once the component has hydrated on
// the client, without needing an effect that calls setState.
function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

interface SearchTriggerProps {
  className?: string;
}

export function SearchTrigger({ className }: SearchTriggerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const isMounted = useIsClient();
  const inputRef = useRef<HTMLInputElement>(null);

  function closeOverlay() {
    setIsOpen(false);
    setQuery("");
  }

  useEscapeKey(isOpen, closeOverlay);
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  const suggestions = useMemo(
    () => (query.trim() ? searchProducts(allProducts, query).slice(0, 6) : []),
    [query],
  );

  function runSearch(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    closeOverlay();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Search"
        className={cn("inline-flex", iconButtonStyles, className)}
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </button>

      {isMounted &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 z-50",
              !isOpen && "pointer-events-none",
            )}
          >
            <div
              onClick={closeOverlay}
              aria-hidden="true"
              className={cn(
                "absolute inset-0 bg-primary/40 transition-opacity duration-300",
                isOpen ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              aria-hidden={!isOpen}
              className={cn(
                "absolute inset-x-0 top-0 bg-white shadow-xl transition-transform duration-300 ease-out",
                isOpen ? "translate-y-0" : "-translate-y-full",
              )}
            >
              <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                      aria-hidden="true"
                    />
                    <input
                      ref={inputRef}
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") runSearch(query);
                      }}
                      placeholder="Search for jewellery, categories, materials..."
                      aria-label="Search products"
                      tabIndex={isOpen ? 0 : -1}
                      className="h-12 w-full rounded-sm border border-beige bg-white pl-11 pr-10 font-body text-sm text-primary placeholder:text-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          inputRef.current?.focus();
                        }}
                        aria-label="Clear search"
                        tabIndex={isOpen ? 0 : -1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={closeOverlay}
                    aria-label="Close search"
                    tabIndex={isOpen ? 0 : -1}
                    className="rounded-sm p-2 text-primary hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                {query.trim() ? (
                  suggestions.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      <span className="font-body text-xs uppercase tracking-wide text-muted">
                        Suggestions
                      </span>
                      {suggestions.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          onClick={closeOverlay}
                          tabIndex={isOpen ? 0 : -1}
                          className="flex items-center justify-between gap-3 rounded-sm px-2 py-2.5 transition-colors hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          <span className="flex flex-col">
                            <span className="font-body text-sm text-primary">
                              {product.name}
                            </span>
                            <span className="font-body text-xs text-muted">
                              {categoryLabel(product.categorySlug)}
                            </span>
                          </span>
                          <span className="font-body text-sm font-medium text-primary">
                            {formatPrice(product.price)}
                          </span>
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={() => runSearch(query)}
                        tabIndex={isOpen ? 0 : -1}
                        className="mt-2 rounded-sm px-2 py-2 text-left font-body text-sm font-medium text-gold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      >
                        See all results for &ldquo;{query}&rdquo;
                      </button>
                    </div>
                  ) : (
                    <p className="font-body text-sm text-muted">
                      No quick matches — press Enter to search all products for
                      &ldquo;{query}&rdquo;.
                    </p>
                  )
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <span className="font-body text-xs uppercase tracking-wide text-muted">
                        Popular Searches
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SEARCHES.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => runSearch(term)}
                            tabIndex={isOpen ? 0 : -1}
                            className="rounded-full border border-beige px-3 py-1.5 font-body text-sm text-primary transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="font-body text-xs uppercase tracking-wide text-muted">
                        Recent Searches
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {RECENT_SEARCHES.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => runSearch(term)}
                            tabIndex={isOpen ? 0 : -1}
                            className="rounded-full bg-beige px-3 py-1.5 font-body text-sm text-primary transition-colors hover:bg-gold hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
