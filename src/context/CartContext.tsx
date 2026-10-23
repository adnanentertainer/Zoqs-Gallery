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
  getMaxAddableQuantity,
  getVariantSummaryLabel,
  getVariantUnitPrice,
  makeCartItemKey,
  type FreeShippingProgress,
} from "@/lib/cart";
import { createLocalStorageStore } from "@/lib/localStorageStore";
import { trackAddToCart } from "@/lib/metaPixel";
import { useToast } from "@/context/ToastContext";
import { siteConfig } from "@/constants/site";
import type { ShippingSettings } from "@/lib/checkout/shipping";
import { calculateBlessedFridayDiscount } from "@/lib/checkout/blessedFriday";
import type { BlessedFridayOffer } from "@/types/blessedFridayOffer";
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
      // Caps this exact variant selection against whatever's already
      // reserved by *other* cart lines of the same product — two colors
      // that share one stock pool can't each be added at full quantity
      // independently (see getMaxAddableQuantity).
      const maxQuantity = getMaxAddableQuantity(
        items,
        product,
        action.selectedVariants,
        key,
      );
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

      // Nothing left in the shared pool for this selection (e.g. another
      // color variant of the same low-stock product already claimed it) —
      // adding a brand-new line here would just fail at checkout, so don't
      // add it at all; addItem() surfaces why via a toast instead.
      if (maxQuantity <= 0) return items;

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
        if (!product) return item;
        const maxQuantity = getMaxAddableQuantity(
          items,
          product,
          item.selectedVariants,
          item.key,
        );
        const nextQuantity =
          action.type === "INCREMENT" ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: clampQuantity(nextQuantity, maxQuantity) };
      });
    }

    case "SET_QUANTITY": {
      return items.map((item) => {
        if (item.key !== action.key) return item;
        const product = getCachedProduct(item.productSlug);
        if (!product) return item;
        const maxQuantity = getMaxAddableQuantity(
          items,
          product,
          item.selectedVariants,
          item.key,
        );
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
  freeShippingSuspended: boolean;
  /** Passed straight through from RootLayout — lets CartSummary (and any
   * other cart UI) show the same "Blessed Friday offer applied" messaging
   * and discount line that checkout already shows, using the same offer
   * settings. */
  blessedFridayOffer: BlessedFridayOffer;
  /** The Blessed Friday discount on the current subtotal, computed the same
   * way checkout computes its own preview (see lib/checkout/blessedFriday) —
   * 0 whenever the offer is off or the cart doesn't meet its minimum spend. */
  blessedFridayDiscount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  isInCart: (
    productSlug: string,
    selectedVariants?: Record<string, string>,
  ) => boolean;
  /** Returns false (and shows an explanatory toast, even when `silent`)
   * when this exact variant has nothing left in its shared stock pool —
   * e.g. a different color of the same low-stock product already claimed
   * it — so callers can skip their own "added!" success state. */
  addItem: (
    product: Product,
    quantity?: number,
    selectedVariants?: Record<string, string>,
    options?: { silent?: boolean },
  ) => boolean;
  incrementItem: (key: string) => void;
  decrementItem: (key: string) => void;
  setItemQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
  /** Same admin-configurable settings checkout uses (see
   * lib/checkout/getShippingSettings.ts) — passed down from the server-
   * rendered root layout so the cart's displayed shipping fee always
   * matches what checkout will actually charge. */
  shippingSettings: ShippingSettings;
  /** Whether the Blessed Friday offer is currently enabled — used only to
   * hide the generic free-shipping progress message (ShippingProgress)
   * while Blessed Friday's own "X% off orders of Rs. Y and above" message is
   * shown in its place instead (same threshold, so showing both would be
   * redundant). Free shipping itself still applies normally either way. */
  freeShippingSuspended: boolean;
  /** Same offer object layout.tsx already fetches above — passed through so
   * the cart can show its own "Blessed Friday offer applied" messaging and
   * discount line. */
  blessedFridayOffer: BlessedFridayOffer;
}

export function CartProvider({
  children,
  shippingSettings,
  freeShippingSuspended,
  blessedFridayOffer,
}: CartProviderProps) {
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
    () => getFreeShippingProgress(subtotal, shippingSettings),
    [subtotal, shippingSettings],
  );

  const blessedFridayDiscount = useMemo(
    () => calculateBlessedFridayDiscount(subtotal, blessedFridayOffer),
    [subtotal, blessedFridayOffer],
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

      const currentItems = cartStore.getSnapshot();
      const key = makeCartItemKey(product.slug, selectedVariants);
      const alreadyInCart = currentItems.some((item) => item.key === key);
      const maxQuantity = getMaxAddableQuantity(
        currentItems,
        product,
        selectedVariants,
        key,
      );

      // This exact variant has nothing left in its shared stock pool — e.g.
      // a different color of the same low-stock product is already in the
      // cart and has claimed it. Adding it anyway would just fail outright
      // at checkout, so say why instead of silently doing nothing.
      if (!alreadyInCart && maxQuantity <= 0) {
        showToast(
          `No more ${getVariantSummaryLabel(product, selectedVariants) ?? "stock"} available right now`,
        );
        return false;
      }

      dispatch({
        type: "ADD",
        productSlug: product.slug,
        quantity,
        selectedVariants,
      });
      trackAddToCart({
        contentId: product.id,
        contentName: product.name,
        value: getVariantUnitPrice(product, selectedVariants),
        currency: siteConfig.currency,
        quantity,
      });
      if (!options?.silent) {
        showToast(`${product.name} added to cart`);
      }
      return true;
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
      freeShippingSuspended,
      blessedFridayOffer,
      blessedFridayDiscount,
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
      freeShippingSuspended,
      blessedFridayOffer,
      blessedFridayDiscount,
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
