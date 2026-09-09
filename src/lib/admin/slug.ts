/** Lowercase letters, digits, and single hyphens — no leading/trailing/double hyphens. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}
