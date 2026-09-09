import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}

function hrefForPage(
  basePath: string,
  searchParams: Record<string, string | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

const linkStyles =
  "inline-flex h-9 items-center gap-1 rounded-sm border border-beige px-3 font-body text-sm text-primary transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";
const disabledStyles = "pointer-events-none opacity-40";

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 pt-4"
    >
      <Link
        href={hrefForPage(basePath, searchParams, page - 1)}
        aria-disabled={page <= 1}
        className={cn(linkStyles, page <= 1 && disabledStyles)}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Previous
      </Link>
      <span className="font-body text-sm text-muted">
        Page {page} of {totalPages}
      </span>
      <Link
        href={hrefForPage(basePath, searchParams, page + 1)}
        aria-disabled={page >= totalPages}
        className={cn(linkStyles, page >= totalPages && disabledStyles)}
      >
        Next
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </nav>
  );
}
