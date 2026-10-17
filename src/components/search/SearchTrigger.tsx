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
import {
  recentSearchesStore,
  recordSearchTerm,
} from "@/lib/recentSearchesStore";
import { categoryLabel, cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

const POPULAR_SEARCHES = [
  "Earrings",
  "Bridal",
  "Kundan",
  "Necklace",
  "Bracelet",
];

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
  const [products, setProducts] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const isMounted = useIsClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFetchedProducts = useRef(false);
  const recentSearches = useSyncExternalStore(
    recentSearchesStore.subscribe,
    recentSearchesStore.getSnapshot,
    recentSearchesStore.getServerSnapshot,
  );

  function closeOverlay() {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }

  useEscapeKey(isOpen, closeOverlay);
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || hasFetchedProducts.current) return;
    hasFetchedProducts.current = true;
    fetch("/api/products/search")
      .then((response) => (response.ok ? response.json() : []))
      .then((data: Product[]) => setProducts(data))
      .catch(() => {
        hasFetchedProducts.current = false;
      });
  }, [isOpen]);

  const suggestions = useMemo(
    () => (query.trim() ? searchProducts(products, query).slice(0, 6) : []),
    [query, products],
  );

  function runSearch(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    recordSearchTerm(trimmed);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    closeOverlay();
  }

  function goToProduct(product: Product) {
    router.push(`/product/${product.slug}`);
    closeOverlay();
  }

  // Flat, keyboard-navigable list matching render order below exactly, so
  // ArrowUp/ArrowDown + Enter can drive whichever list is currently showing
  // (quick-match suggestions, or popular/recent terms when the box is empty).
  const navItems = useMemo(() => {
    if (query.trim()) {
      if (suggestions.length === 0) return [];
      return [
        ...suggestions.map((product) => ({
          onSelect: () => goToProduct(product),
        })),
        { onSelect: () => runSearch(query) },
      ];
    }
    return [
      ...POPULAR_SEARCHES.map((term) => ({ onSelect: () => runSearch(term) })),
      ...recentSearches.map((term) => ({ onSelect: () => runSearch(term) })),
    ];
    // goToProduct/runSearch close over router, which is referentially stable
    // across renders — only the data they operate on needs to be tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, suggestions, recentSearches]);

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
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setActiveIndex(-1);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          if (navItems.length === 0) return;
                          event.preventDefault();
                          setActiveIndex((i) => (i + 1) % navItems.length);
                        } else if (event.key === "ArrowUp") {
                          if (navItems.length === 0) return;
                          event.preventDefault();
                          setActiveIndex((i) =>
                            i <= 0 ? navItems.length - 1 : i - 1,
                          );
                        } else if (event.key === "Enter") {
                          event.preventDefault();
                          if (activeIndex >= 0 && navItems[activeIndex]) {
                            navItems[activeIndex].onSelect();
                          } else {
                            runSearch(query);
                          }
                        }
                      }}
                      placeholder="Search for jewellery, categories, materials..."
                      aria-label="Search products"
                      role="combobox"
                      aria-expanded={isOpen}
                      aria-autocomplete="list"
                      aria-controls="search-trigger-results"
                      tabIndex={isOpen ? 0 : -1}
                      className="h-12 w-full rounded-2xl border border-beige bg-white pl-11 pr-10 font-body text-sm text-primary placeholder:text-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setActiveIndex(-1);
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

                <div id="search-trigger-results">
                  {query.trim() ? (
                    suggestions.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-body text-xs uppercase tracking-wide text-muted">
                          Suggestions
                        </span>
                        {suggestions.map((product, index) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            onClick={closeOverlay}
                            onMouseEnter={() => setActiveIndex(index)}
                            tabIndex={isOpen ? 0 : -1}
                            className={cn(
                              "flex items-center justify-between gap-3 rounded-sm px-2 py-2.5 transition-colors hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                              activeIndex === index && "bg-beige",
                            )}
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
                          onMouseEnter={() =>
                            setActiveIndex(suggestions.length)
                          }
                          tabIndex={isOpen ? 0 : -1}
                          className={cn(
                            "mt-2 rounded-sm px-2 py-2 text-left font-body text-sm font-medium text-gold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                            activeIndex === suggestions.length && "underline",
                          )}
                        >
                          See all results for &ldquo;{query}&rdquo;
                        </button>
                      </div>
                    ) : (
                      <p className="font-body text-sm text-muted">
                        No quick matches — press Enter to search all products
                        for &ldquo;{query}&rdquo;.
                      </p>
                    )
                  ) : (
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <span className="font-body text-xs uppercase tracking-wide text-muted">
                          Popular Searches
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {POPULAR_SEARCHES.map((term, index) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => runSearch(term)}
                              onMouseEnter={() => setActiveIndex(index)}
                              tabIndex={isOpen ? 0 : -1}
                              className={cn(
                                "rounded-full border border-beige px-3 py-1.5 font-body text-sm text-primary transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                                activeIndex === index &&
                                  "border-gold text-gold",
                              )}
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                      {recentSearches.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <span className="font-body text-xs uppercase tracking-wide text-muted">
                            Recent Searches
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {recentSearches.map((term, index) => {
                              const flatIndex = POPULAR_SEARCHES.length + index;
                              return (
                                <button
                                  key={term}
                                  type="button"
                                  onClick={() => runSearch(term)}
                                  onMouseEnter={() => setActiveIndex(flatIndex)}
                                  tabIndex={isOpen ? 0 : -1}
                                  className={cn(
                                    "rounded-full bg-beige px-3 py-1.5 font-body text-sm text-primary transition-colors hover:bg-gold hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                                    activeIndex === flatIndex &&
                                      "bg-gold text-white",
                                  )}
                                >
                                  {term}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
