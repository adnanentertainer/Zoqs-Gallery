"use client";

import { createLocalStorageStore } from "@/lib/localStorageStore";

const STORAGE_KEY = "zoqs-gallery-recent-searches";
const MAX_ITEMS = 5;

function isValidRecentSearches(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((term) => typeof term === "string")
  );
}

// Stores the shopper's own past search terms, shown back to them as "Recent
// Searches" in the search overlay. Never seeded with placeholder terms --
// an empty list just means the section doesn't render (see SearchTrigger).
export const recentSearchesStore = createLocalStorageStore<string[]>(
  STORAGE_KEY,
  [],
  isValidRecentSearches,
);

export function recordSearchTerm(term: string): void {
  const trimmed = term.trim();
  if (!trimmed) return;
  const current = recentSearchesStore.getSnapshot();
  const next = [
    trimmed,
    ...current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, MAX_ITEMS);
  recentSearchesStore.set(next);
}
