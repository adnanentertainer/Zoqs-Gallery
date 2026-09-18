"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { ensureProductsCached, getCachedProduct } from "@/lib/productCache";
import { createLocalStorageStore } from "@/lib/localStorageStore";
import { useToast } from "@/context/ToastContext";

const STORAGE_KEY = "zoqs-gallery-wishlist";

function isValidWishlistItems(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((slug) => typeof slug === "string")
  );
}

// Stores product SLUGS (not ids) — see the comment in CartContext.tsx for why.
// Full product data for rendering (e.g. on /wishlist) comes from the shared
// client-side cache in lib/productCache.ts.
const wishlistStore = createLocalStorageStore<string[]>(
  STORAGE_KEY,
  [],
  isValidWishlistItems,
);

interface WishlistContextValue {
  items: string[];
  count: number;
  isWishlisted: (productSlug: string) => boolean;
  addItem: (productSlug: string, productName?: string) => void;
  removeItem: (productSlug: string, productName?: string) => void;
  toggleItem: (productSlug: string, productName?: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined,
);

function resolveName(productSlug: string, productName?: string) {
  return productName ?? getCachedProduct(productSlug)?.name;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    wishlistStore.getServerSnapshot,
  );
  const { showToast } = useToast();

  // The header badge shows items.length, so a wishlisted product that's
  // since been deleted or deactivated would otherwise count forever without
  // ever appearing on /wishlist. Confirm each slug still resolves to a real
  // product and drop the ones that don't.
  useEffect(() => {
    let cancelled = false;
    ensureProductsCached(items).then((missingSlugs) => {
      if (cancelled || missingSlugs.length === 0) return;
      const current = wishlistStore.getSnapshot();
      wishlistStore.set(
        current.filter((slug) => !missingSlugs.includes(slug)),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  const isWishlisted = useCallback(
    (productSlug: string) => items.includes(productSlug),
    [items],
  );

  const addItem = useCallback(
    (productSlug: string, productName?: string) => {
      if (!items.includes(productSlug)) {
        wishlistStore.set([...items, productSlug]);
      }
      const name = resolveName(productSlug, productName);
      showToast(name ? `${name} added to wishlist` : "Added to wishlist");
    },
    [items, showToast],
  );

  const removeItem = useCallback(
    (productSlug: string, productName?: string) => {
      wishlistStore.set(items.filter((slug) => slug !== productSlug));
      const name = resolveName(productSlug, productName);
      showToast(
        name ? `${name} removed from wishlist` : "Removed from wishlist",
      );
    },
    [items, showToast],
  );

  const toggleItem = useCallback(
    (productSlug: string, productName?: string) => {
      const exists = items.includes(productSlug);
      wishlistStore.set(
        exists
          ? items.filter((slug) => slug !== productSlug)
          : [...items, productSlug],
      );
      const name = resolveName(productSlug, productName);
      showToast(
        exists
          ? name
            ? `${name} removed from wishlist`
            : "Removed from wishlist"
          : name
            ? `${name} added to wishlist`
            : "Added to wishlist",
      );
    },
    [items, showToast],
  );

  const clearWishlist = useCallback(() => wishlistStore.set([]), []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      isWishlisted,
      addItem,
      removeItem,
      toggleItem,
      clearWishlist,
    }),
    [items, isWishlisted, addItem, removeItem, toggleItem, clearWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
