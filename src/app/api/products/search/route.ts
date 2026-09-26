import { NextResponse } from "next/server";
import { getProducts } from "@/lib/services/productService";

// Backs the client-side quick-search overlay (SearchTrigger), which can't
// call getProducts() directly since it's a "use client" component. Returns
// the same live, active-only catalog every listing page already shows —
// never the static mock fixture in src/data/products.ts.
export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}
