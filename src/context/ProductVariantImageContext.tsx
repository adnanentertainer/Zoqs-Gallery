"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getDefaultVariantSelections } from "@/lib/cart";
import type { Product } from "@/types";

interface ProductVariantSelectionContextValue {
  selections: Record<string, string>;
  setSelections: (
    update:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
}

const ProductVariantSelectionContext =
  createContext<ProductVariantSelectionContextValue | null>(null);

// Holds the shopper's variant picks (e.g. { color: "Pink" }) so the swatches
// (ProductActions) and the image gallery (ProductGallery) can both read and
// change the same selection, even though they're rendered as siblings with
// unrelated content between them on the product page.
export function ProductVariantImageProvider({
  product,
  children,
}: {
  product: Product;
  children: ReactNode;
}) {
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    getDefaultVariantSelections(product),
  );
  const value = useMemo(
    () => ({ selections, setSelections }),
    [selections],
  );

  return (
    <ProductVariantSelectionContext.Provider value={value}>
      {children}
    </ProductVariantSelectionContext.Provider>
  );
}

export function useProductVariantSelection(): ProductVariantSelectionContextValue {
  const context = useContext(ProductVariantSelectionContext);
  if (!context) {
    throw new Error(
      "useProductVariantSelection must be used within a ProductVariantImageProvider",
    );
  }
  return context;
}
