"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface ProductVariantImageContextValue {
  variantImage: string | null;
  setVariantImage: (image: string | null) => void;
}

const ProductVariantImageContext =
  createContext<ProductVariantImageContextValue | null>(null);

// Bridges the variant swatches (ProductActions) to the main image (ProductGallery)
// even though they're rendered as siblings with unrelated content between them on
// the product page, rather than requiring the page to lift and thread state itself.
export function ProductVariantImageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [variantImage, setVariantImage] = useState<string | null>(null);
  const value = useMemo(
    () => ({ variantImage, setVariantImage }),
    [variantImage],
  );

  return (
    <ProductVariantImageContext.Provider value={value}>
      {children}
    </ProductVariantImageContext.Provider>
  );
}

export function useProductVariantImage(): ProductVariantImageContextValue {
  const context = useContext(ProductVariantImageContext);
  if (!context) {
    throw new Error(
      "useProductVariantImage must be used within a ProductVariantImageProvider",
    );
  }
  return context;
}
