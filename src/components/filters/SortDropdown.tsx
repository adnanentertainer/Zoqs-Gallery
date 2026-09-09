"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { SORT_OPTIONS } from "@/constants/filters";
import { parseSortKey } from "@/lib/products";
import { buildUrl } from "@/lib/utils";

export function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = parseSortKey(searchParams.get("sort"));

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(buildUrl(pathname, params), { scroll: false });
  }

  return (
    <label className="relative inline-flex items-center gap-2 rounded-sm border border-beige px-3 py-2 font-body text-sm text-primary transition-colors hover:border-gold focus-within:border-gold">
      <ArrowUpDown className="h-4 w-4 text-muted" aria-hidden="true" />
      <span className="sr-only">Sort products</span>
      <select
        value={currentSort}
        onChange={(event) => handleChange(event.target.value)}
        className="appearance-none bg-transparent pr-1 focus:outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
