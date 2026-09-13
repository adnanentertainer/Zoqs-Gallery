"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ensureProductsCached,
  getCachedProduct,
  registerProduct,
  subscribeToProductCache,
} from "@/lib/productCache";
import {
  getFreeShippingProgress,
  getVariantUnitPrice,
  makeCartItemKey,
  type FreeShippingProgress,
} from "@/lib/cart";
import { createLocalStorageStore } from "@/lib/localStorageStore";
import { useToast } from "@/context/ToastContext";
import type { Product } from "@/types";

const STORAGE_KEY = "zoqs-gallery-cart";

// Cart items are keyed by product SLUG rather than product.id, since slug is
// the one product identifier already present in the URL/page everywhere a
// cart action originates. Full Product data (name, price, stock, images) is
// resolved via the shared client-side cache in lib/productCache.ts, not
// stored in localStorage — see that file for how it's populated.
export interface CartItem {
  key: string;
  productSlug: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface CartLineItem extends CartItem {
  product: Product;
  unitPrice: number;
  lineSubtotal: number;
}

type CartAction =
  | {
      type: "ADD";
      productSlug: string;
      quantity: number;
      selectedVariants?: Record<string, string>;
    }
  | { type: "INCREMENT"; key: string }
  | { type: "DECREMENT"; key: string }
  | { type: "SET_QUANTITY"; key: string; quantity: number }
  | { type: "REMOVE"; key: string }
  | { type: "CLEAR" };

function clampQuantity(quantity: number, max: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(Math.max(Math.round(quantity), 1), Math.max(max, 1));
}

function applyCartAction(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const product = getCachedProduct(action.productSlug);
      if (!product) return items;
      const key = makeCartItemKey(action.productSlug, action.selectedVariants);
      const maxQuantity = Math.max(product.stock, 1);
      const existing = items.find((item) => item.key === key);

      if (existing) {
        return items.map((item) =>
          item.key === key
            ? {
                ...item,
                quantity: clampQuantity(
                  item.quantity + action.quantity,
                  maxQuantity,
                ),
              }
            : item,
        );
      }

      return [
        ...items,
        {
          key,
          productSlug: action.productSlug,
          quantity: clampQuantity(action.quantity, maxQuantity),
          selectedVariants: action.selectedVariants,
        },
      ];
    }

    case "INCREMENT":
    case "DECREMENT": {
      return items.map((item) => {
        if (item.key !== action.key) return item;
        const product = getCachedProduct(item.productSlug);
        const maxQuantity = Math.max(product?.stock ?? 1, 1);
        const nextQuantity =
          action.type === "INCREMENT" ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: clampQuantity(nextQuantity, maxQuantity) };
      });
    }

    case "SET_QUANTITY": {
      return items.map((item) => {
        if (item.key !== action.key) return item;
        const product = getCachedProduct(item.productSlug);
        const maxQuantity = Math.max(product?.stock ?? 1, 1);
        return {
          ...item,
          quantity: clampQuantity(action.quantity, maxQuantity),
        };
      });
    }

    case "REMOVE":
      return items.filter((item) => item.key !== action.key);

    case "CLEAR":
      return [];

    default:
      return items;
  }
}

function isValidCartItems(value: unknown): value is CartItem[] {
  if (!Array.isArray(value)) return false;
  return value.every((entry) => {
    if (typeof entry !== "object" || entry === null) return false;
    const candidate = entry as Partial<CartItem>;
    return (
      typeof candidate.key === "string" &&
      typeof candidate.productSlug === "string" &&
      typeof candidate.quantity === "number" &&
      candidate.quantity > 0
    );
  });
}

const cartStore = createLocalStorageStore<CartItem[]>(
  STORAGE_KEY,
  [],
  isValidCartItems,
);

interface CartContextValue {
  items: CartItem[];
  lineItems: CartLineItem[];
  totalQuantity: number;
  subtotal: number;
  freeShipping: FreeShippingProgress;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  isInCart: (
    productSlug: string,
    selectedVariants?: Record<string, string>,
  ) => boolean;
  addItem: (
    product: Product,
    quantity?: number,
    selectedVariants?: Record<string, string>,
    options?: { silent?: boolean },
  ) => void;
  incrementItem: (key: string) => void;
  decrementItem: (key: string) => void;
  setItemQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { showToast } = useToast();

  const dispatch = useCallback((action: CartAction) => {
    cartStore.set(applyCartAction(cartStore.getSnapshot(), action));
  }, []);

  const [productCacheVersion, bumpProductCacheVersion] = useReducer(
    (count: number) => count + 1,
    0,
  );

  useEffect(
    () => subscribeToProductCache(bumpProductCacheVersion),
    [],
  );

  useEffect(() => {
    ensureProductsCached(items.map((item) => item.productSlug));
  }, [items]);

  const lineItems = useMemo<CartLineItem[]>(() => {
    return items.flatMap((item) => {
      const product = getCachedProduct(item.productSlug);
      if (!product) return [];
      const unitPrice = getVariantUnitPrice(product, item.selectedVariants);
      return [
        {
          ...item,
          product,
          unitPrice,
          lineSubtotal: unitPrice * item.quantity,
        },
      ];
    });
    // productCacheVersion isn't read in the body above, but including it
    // forces this memo to recompute once the background
    // /api/products/lookup fetch resolves and populates the cache.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, productCacheVersion]);

  const totalQuantity = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.quantity, 0),
    [lineItems],
  );

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.lineSubtotal, 0),
    [lineItems],
  );

  const freeShipping = useMemo(
    () => getFreeShippingProgress(subtotal),
    [subtotal],
  );

  const isInCart = useCallback(
    (productSlug: string, selectedVariants?: Record<string, string>) =>
      items.some(
        (item) => item.key === makeCartItemKey(productSlug, selectedVariants),
      ),
    [items],
  );

  const addItem = useCallback(
    (
      product: Product,
      quantity = 1,
      selectedVariants?: Record<string, string>,
      options?: { silent?: boolean },
    ) => {
      // Registering the product synchronously, before dispatch, guarantees
      // the reducer's cache lookup (for stock clamping) hits immediately —
      // no dependency on a background fetch having resolved first.
      registerProduct(product);
      dispatch({
        type: "ADD",
        productSlug: product.slug,
        quantity,
        selectedVariants,
      });
      if (!options?.silent) {
        showToast(`${product.name} added to cart`);
      }
    },
    [dispatch, showToast],
  );

  const removeItem = useCallback(
    (key: string) => {
      const item = items.find((candidate) => candidate.key === key);
      const product = item ? getCachedProduct(item.productSlug) : undefined;
      dispatch({ type: "REMOVE", key });
      showToast(
        product ? `${product.name} removed from cart` : "Removed from cart",
      );
    },
    [items, dispatch, showToast],
  );

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);
  const incrementItem = useCallback(
    (key: string) => dispatch({ type: "INCREMENT", key }),
    [dispatch],
  );
  const decrementItem = useCallback(
    (key: string) => dispatch({ type: "DECREMENT", key }),
    [dispatch],
  );
  const setItemQuantity = useCallback(
    (key: string, quantity: number) =>
      dispatch({ type: "SET_QUANTITY", key, quantity }),
    [dispatch],
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), [dispatch]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      lineItems,
      totalQuantity,
      subtotal,
      freeShipping,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      isInCart,
      addItem,
      incrementItem,
      decrementItem,
      setItemQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      lineItems,
      totalQuantity,
      subtotal,
      freeShipping,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      isInCart,
      addItem,
      incrementItem,
      decrementItem,
      setItemQuantity,
      removeItem,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
