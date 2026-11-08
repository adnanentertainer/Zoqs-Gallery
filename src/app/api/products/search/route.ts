import { NextResponse } from "next/server";
import { getProductSearchSummaries } from "@/lib/services/productService";

// Backs the client-side quick-search overlay (SearchTrigger), which can't
// call a server service directly since it's a "use client" component.
// getProductSearchSummaries() selects only the fields the overlay's fuzzy
// match and suggestion row need -- no images/variants/reviews joins, unlike
// the full hydrated catalog /search's real results page needs.
export async function GET() {
  const summaries = await getProductSearchSummaries();
  return NextResponse.json(summaries);
}
