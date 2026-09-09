export const DEFAULT_ADMIN_PAGE_SIZE = 20;

/** Never trust a raw query-string value — clamp to a safe positive integer. */
export function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function parseEnumParam<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Flattens Next.js's searchParams shape to plain strings for building hrefs. */
export function toFlatSearchParams(
  params: RawSearchParams,
): Record<string, string | undefined> {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    flat[key] = firstValue(value);
  }
  return flat;
}
