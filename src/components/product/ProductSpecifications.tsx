import { categoryLabel, formatPrice } from "@/lib/utils";
import { isInStock } from "@/lib/products";
import type { Product } from "@/types";

interface ProductSpecificationsProps {
  product: Product;
}

export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Material", value: product.material },
    { label: "Color", value: product.color },
    { label: "Occasion", value: product.occasion },
    { label: "Category", value: categoryLabel(product.categorySlug) },
  ];

  if (product.weight) rows.push({ label: "Weight", value: product.weight });
  if (product.dimensions)
    rows.push({ label: "Dimensions", value: product.dimensions });
  rows.push({ label: "Price", value: formatPrice(product.price) });
  rows.push({
    label: "Availability",
    value: isInStock(product) ? "In Stock" : "Out of Stock",
  });

  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex justify-between gap-4 border-b border-beige pb-3 sm:justify-start"
        >
          <dt className="font-body text-sm text-muted">{row.label}</dt>
          <dd className="font-body text-sm font-medium text-primary sm:ml-auto">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
