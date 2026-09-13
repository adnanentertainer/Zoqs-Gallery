"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getCachedProduct } from "@/lib/productCache";
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
