# ZOQ's Gallery

Premium artificial jewellery storefront for the Pakistani market, built with Next.js (App Router), TypeScript, and Tailwind CSS. Cart and wishlist are client-side (React Context + localStorage); the product/category/review catalog is served from Supabase when configured, with a local mock-data fallback for development.

## 1. Project setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without any Supabase configuration the site runs entirely on the local mock catalog in `src/data/` — this is a fully supported mode, not a degraded one (see [§10](#10-mock-fallback-vs-supabase)).

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in what you need:

```bash
cp .env.example .env.local
```

| Variable                        | Used by                 | Notes                                                                                             |
| ------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | app + `scripts/seed.ts` | Public. Safe to expose to the browser.                                                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | app                     | Public. RLS policies (below) restrict what it can do.                                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | `scripts/seed.ts` only  | **Secret.** Bypasses RLS. Never imported by app code, never sent to the browser, never committed. |

`.env.local` is already covered by `.gitignore` (`.env*` is ignored, `.env.example` is explicitly un-ignored) — never commit real credentials.

Leaving `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` blank runs the app on mock data automatically; no code change needed to switch back and forth.

## 3. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the **Project URL** and the **anon/public key** into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Also copy the **service_role key** into `.env.local` as `SUPABASE_SERVICE_ROLE_KEY` — used only by the local seed script (§7), never by the running app.

## 4. Database migration

The schema lives in `supabase/migrations/20260909031325_initial_schema.sql`. It creates `categories`, `products`, `product_images`, `product_variants`, `reviews`, `site_settings`, all indexes, the `updated_at` triggers, the trigger that keeps `categories.product_count` in sync automatically, and Row Level Security policies.

Run it either:

- **Supabase Dashboard → SQL Editor**: paste the file's contents and run it, or
- **Supabase CLI**, if you have a project linked:
  ```bash
  npx supabase db push
  ```

## 5. Row Level Security

RLS is enabled on every table in the migration. Public (anon) reads are allowed only for active/approved rows:

- `categories` — `is_active = true`
- `products` — `is_active = true`
- `product_images` / `product_variants` — only for products that are active (variants also require `is_active = true` on the variant itself)
- `reviews` — `is_approved = true` and the parent product is active
- `site_settings` — all rows readable

No insert/update/delete policies exist for any table — with RLS on and no matching policy, PostgREST denies those operations to the anon key by default. Only the `service_role` key (used exclusively by `scripts/seed.ts`) can write.

## 6. Storage bucket (product images)

The schema stores image URLs as plain text (`product_images.image_url`), so it works with any public URL — including the Unsplash URLs the mock catalog already uses. You don't need to upload anything to use the seeded data as-is.

To move images into Supabase Storage later:

1. In the Supabase Dashboard, create a bucket named `product-images` and mark it **public** (or add a policy granting public `SELECT`).
2. Upload files (JPEG/PNG/WebP; a few hundred KB each is plenty for a jewellery product photo — there's no hard app-side limit, but keep originals reasonably optimized).
3. Use the resulting public URL — `https://<project-ref>.supabase.co/storage/v1/object/public/product-images/<path>` — as a `product_images.image_url` value.
4. `next.config.ts` already whitelists `*.supabase.co/storage/v1/object/public/**` for `next/image`; once you know your exact project hostname, consider narrowing that `remotePatterns` entry to it specifically.

## 7. Seed data

`scripts/seed.ts` copies the existing mock catalog (`src/data/categories.ts`, `products.ts`, `reviews.ts`) and `src/constants/site.ts` into Supabase — the same 16 products, 7 categories, and 48 reviews the mock-data mode already uses, so the two modes render identically.

```bash
npm run seed
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (§2–3). It reads `.env.local` itself — no extra flags needed.

Safe to re-run: categories/products/settings are upserted by their unique slug/key (so ids stay stable across runs), and each product's images/variants/reviews are deleted and re-inserted from the current mock data, so re-running never accumulates duplicates.

## 8. Local development

```bash
npm run dev          # start the dev server
npm run lint          # ESLint
npm run format        # Prettier — write
npm run format:check  # Prettier — check only
npx tsc --noEmit       # TypeScript
```

## 9. Build

```bash
npm run build
npm run start
```

## 10. Mock fallback vs. Supabase

Every data-fetching function in `src/lib/services/*.ts` checks `isSupabaseConfigured()` (i.e. whether both `NEXT_PUBLIC_SUPABASE_*` variables are set) **before** doing anything else:

- **Not configured** → returns data from the local mock catalog (`src/data/`) directly. This is the default for local development without a Supabase project.
- **Configured** → queries Supabase and maps rows onto the app's existing `Product`/`Category`/`Review` types (`src/lib/supabase/mappers.ts`). If the query itself fails (bad credentials, network issue, RLS misconfiguration, etc.), the error is logged to the server console and a generic error is thrown — it does **not** silently fall back to mock data. A real production database failure should surface as an error, not be masked.

A few client-side, synchronous-by-necessity pieces intentionally keep reading the local mock catalog regardless of Supabase configuration, since they can't `await` a network call on every interaction:

- **Cart and wishlist** (`src/context/CartContext.tsx`, `WishlistContext.tsx`) resolve items by **product slug** against the mock catalog. Slugs are identical in both modes (the seed script preserves them), so a product added to the cart from a Supabase-rendered page still resolves correctly.
- The header's instant-search dropdown (`SearchTrigger`) and the shop/category filter sidebar's category checkboxes read the mock catalog/category list directly for the same reason — they need synchronous, per-keystroke or per-render data.
- "Recently Viewed" on the product page is an explicitly lightweight mock (no real view-history tracking exists) and stays mock-sourced either way.

None of this affects what's actually _displayed_ as the primary catalog — homepage, shop, category, search results, and the product detail page all go through the service layer and render Supabase data whenever it's configured.

## 11. Generating Supabase types

`src/types/supabase.ts` is hand-written to mirror the SQL migration, since there's no linked Supabase project in this environment to generate types from. Once you have one:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase gen types typescript --linked > src/types/supabase.ts
```

(`npx` downloads the Supabase CLI on demand — no global install required.) Re-run this after any schema change instead of hand-editing the file.

## 12. Checkout & orders (Phase 9)

Customers can add products to cart, check out, and place an order for **Cash on Delivery** or **Bank Transfer**. There is no real payment gateway integration — this phase intentionally stops short of that (no Stripe/JazzCash/Easypaisa/PayPal). Bank Transfer is informational only; payment details are never invented and are configured later, outside this codebase.

### Architecture

- **Auth-gated**: `/checkout` and `/order-confirmation/[orderNumber]` require a signed-in user. `src/proxy.ts` redirects unauthenticated visitors to `/login?redirect=<path>` before the page renders (defense in depth: the pages also check server-side via `getServerUser()`, same pattern as `/account`).
- **Server-side order creation, not a client insert**: the checkout form is a client component, but placing an order calls a Server Action (`src/app/checkout/actions.ts`), which calls `orderService.createOrder()`, which calls the `create_order()` Postgres function via RPC. The client only ever sends `{ productSlug, quantity, selectedVariants }` per line item — never a price, subtotal, shipping cost, or total.
- **`create_order()` is the only way orders/order_items ever get written.** It's a `SECURITY DEFINER` Postgres function (see `supabase/migrations/20260909145411_orders.sql`) that:
  1. Requires `auth.uid()` to be set (rejects anonymous callers) — checked explicitly in the function body, and additionally at the permission layer (`EXECUTE` is revoked from `anon`/`PUBLIC` and granted only to `authenticated`; Supabase's default privileges grant `anon` EXECUTE **directly**, not just via `PUBLIC`, so both must be revoked explicitly).
  2. Re-fetches each product (and matching variant, if any) fresh from the database by slug — verifies it's active, validates stock, and computes the real unit price server-side. A client-supplied price/total field is never read.
  3. Computes shipping cost from `site_settings` (`free_shipping_threshold`, `flat_shipping_cost` — same keys `getShippingSettings()` reads for the client-facing estimate), never from the client.
  4. Decrements `products.stock` (or `product_variants.stock` when the line has a tracked variant) atomically in the same statement that checks it, so a concurrent order for the last unit can't oversell.
  5. Generates a unique `ZOQ-YYYYMMDD-XXXX` order number, retrying on collision.
  6. Inserts the order and its line items. Because this all happens inside one `plpgsql` function, it's one implicit transaction — any validation failure partway through (bad product, insufficient stock, etc.) rolls back everything already done in that call, so there's never a partial order or a stock decrement without a matching order.
- **Order items snapshot product data at purchase time** (`product_name`, `variant_name`, `product_price`, `product_image_url`) rather than joining to `products`/`product_variants` at display time — so a later price change or product deletion never alters historical orders. The FK to `products`/`product_variants` is `ON DELETE SET NULL` for this reason.

### Database

`orders` and `order_items` (see the migration for full column list, constraints, and indexes):

- `orders.status`: `pending` (default) → `confirmed` → `processing` → `shipped` → `delivered`, or `cancelled`. Enforced by a `CHECK` constraint. No admin UI exists yet to change it (Phase 10).
- `orders.payment_status`: `pending` (default), `paid`, `failed`, `refunded`. Both Cash on Delivery and Bank Transfer orders are created with `payment_status = pending` — nothing is ever auto-marked `paid`.
- All money columns are `integer` (whole PKR rupees) — no floating point, matching the `products.price` convention from Phase 7.

### Row Level Security

- `orders` / `order_items`: authenticated users can `SELECT` only their own rows (`auth.uid() = orders.user_id`, and `order_items` via a join back to `orders`). No `INSERT`/`UPDATE`/`DELETE` policy exists for either table — all writes happen inside `create_order()`, which runs as the function owner and bypasses RLS internally by design (that's what `SECURITY DEFINER` is for), while still enforcing its own `auth.uid()` check.
- Verified live against a real Supabase project: an anonymous key cannot read or write `orders` at all; a second real authenticated user cannot read a first user's order by order number or by listing `orders` (RLS scopes the result to their own `user_id`); a crafted client-supplied `price` field in the RPC payload is silently ignored in favor of the server-computed price.

### Shipping configuration

Centralized in two places that must be read from, not duplicated:

- `src/constants/site.ts` — `freeShippingThreshold` (3000) and `flatShippingCost` (250) as the development fallback.
- `site_settings` rows `free_shipping_threshold` / `flat_shipping_cost` (seeded by `scripts/seed.ts`) — the source of truth once Supabase is configured. `getShippingSettings()` (`src/lib/checkout/getShippingSettings.ts`) reads these for the checkout page's displayed estimate; `create_order()` reads the same table independently server-side for the authoritative charge.

### Known limitations

- No real payment gateway. COD and Bank Transfer only, as scoped.
- Order history UI is a placeholder ("Order history coming soon" on `/account`) — full history is deferred to a future phase.
- Stock validation and decrement are server-side and atomic, but this is simple last-unit protection, not a full inventory reservation/hold system (e.g. no cart-level stock reservation while a customer is mid-checkout).
- The full 320–1440px responsive sweep for the checkout form specifically was not completed end-to-end due to a recurring browser-extension automation issue in the dev environment; the desktop flow and a couple of mobile spot-checks (login, product page at 375px) were verified.

## 13. Admin dashboard (Phase 10)

A secured admin dashboard at `/admin` for managing products, categories, orders, customers, and store settings. It is a separate area of the app — it does not touch or restyle the public storefront, and reuses the same design tokens, `Button`/`Input`/`Badge`/`Typography` components, Supabase clients, and services architecture already in place.

### Role architecture

`profiles.role` (`supabase/migrations/20260909154249_admin_roles.sql`) is `'customer'` (default) or `'admin'`, enforced by a `CHECK` constraint. Every new and existing user defaults to `'customer'` — nothing in signup, the profile-update flow, or any public API can grant `'admin'`.

**This is enforced at three layers, not just one:**

1. **Database column privilege**: `UPDATE` on `profiles` is revoked from `authenticated` and re-granted only for `(full_name, first_name, last_name, phone, avatar_url)` — `role` is not in that list, so even a hand-crafted `PATCH` request against `/rest/v1/profiles` setting `role: "admin"` is rejected by Postgres itself (`42501 permission denied`), not merely hidden by the UI. Verified live: a real authenticated customer's attempt to self-promote was rejected this way.
2. **`requireAdmin()`** (`src/lib/auth/requireAdmin.ts`): the single gate used by both the `/admin` layout (page-level) and every admin Server Action (mutation-level, so a crafted direct request to a mutation can't skip the layout). Unauthenticated → redirect to `/login?redirect=<path>`. Authenticated but not admin → a plain `notFound()` (404), never a distinguishable "Access Denied" page — a customer probing `/admin` learns nothing about whether it exists. Verified live with a real second customer account: visiting `/admin` while logged in returns the storefront's normal 404 page.
3. **RLS with an `is_admin()` helper**: see below — the database itself refuses admin-only writes even if application code were somehow bypassed.

### Initial admin setup

There is no admin signup flow, and none should ever be added. To promote an existing account, run this SQL yourself in the Supabase SQL Editor (never exposed in the app):

```sql
update profiles
set role = 'admin'
where id = (select id from auth.users where email = 'the-persons-email@example.com');
```

This should only ever be run by a trusted database administrator with dashboard access.

### RLS changes

`is_admin()` (`SECURITY DEFINER`, `set search_path = public`) checks `profiles.role` for `auth.uid()`. It must be `SECURITY DEFINER`: a plain function would re-trigger `profiles`' own SELECT policy while that same policy is being evaluated (a recursive RLS check); running as the function owner (which bypasses RLS entirely) reads the role directly instead. `EXECUTE` is revoked from `anon` **and** `public` — Supabase's default privileges grant `anon` execute directly on new functions, not merely through `PUBLIC`, so both must be revoked explicitly (the same gap was found and fixed for `create_order()` in Phase 9).

This function backs new admin-only policies added on top of the existing Phase 7/9 policies (which are untouched):

- `products`, `categories`, `product_images`, `product_variants`: admins get a `SELECT` policy that also surfaces inactive rows (the public policy still only shows active ones), plus `INSERT`/`UPDATE`/`DELETE`.
- `orders`, `order_items`: admins get a `SELECT` policy covering every row (customers still only see their own). Admin `UPDATE` on `orders` is further restricted at the column-privilege level to `(status, payment_status)` only — even a bug in the admin UI cannot touch totals, shipping cost, or the customer's shipping snapshot, because the database itself won't allow it.
- `profiles`: admins get a `SELECT` policy covering every row (for `/admin/customers`); no admin `UPDATE` policy was added, since this phase intentionally ships no role-editing UI (see Known limitations).
- `site_settings`: admins get `UPDATE`; public reads are unchanged.

### Admin routes

`/admin` (dashboard), `/admin/products` (+ `/new`, `/[id]`), `/admin/categories` (+ `/new`, `/[id]`), `/admin/orders` (+ `/[id]`), `/admin/customers` (+ `/[id]`), `/admin/settings`. All are `noindex, nofollow`.

### What's manageable

- **Products**: search/filter (category, active/inactive, in-stock/low-stock/out-of-stock)/sort/pagination, create/edit with images (URL-based — no file upload; Supabase Storage isn't configured in this project, see Phase 7 §6) and variants, and delete-or-deactivate. A product is only hard-deletable when it has zero `order_items` referencing it; otherwise the UI offers "Deactivate" instead, since `order_items.product_id` is `ON DELETE SET NULL` for historical accuracy but permanently deleting a purchased product's own record still felt like the wrong default. Verified live: create → appears on the public shop → deactivate → 404s on the public product page → delete (no order history) → gone from both.
- **Categories**: create/edit/delete, with delete blocked (friendly error, not a raw FK violation) while any product is still assigned to it — verified live against a real category with products.
- **Orders**: search/filter/pagination; detail view with a status/payment-status editor. Both are validated against the fixed enums server-side before ever reaching the database.
- **Customers**: search/pagination list (name, email, phone, role, joined date — never passwords or auth tokens); detail view with up to 5 recent orders. Per-customer order counts are intentionally omitted from the _list_ (not the detail page) — there's no single-query way to get a per-row related count via PostgREST without an N+1 query per page, which isn't "efficient."
- **Settings**: store name, currency, country, free shipping threshold, flat shipping cost — the same `site_settings` keys from Phase 7/9, not a new storage mechanism.

### Known limitations

- No role-management UI. Promoting/demoting an admin remains a manual SQL step by design (see Initial admin setup) — this was an explicit, deliberate scope decision for this phase, not an oversight.
- The dashboard's "Total Order Value" sums order totals in the application rather than via a database-side aggregate: this Supabase project has PostgREST's aggregate-function `select` syntax (e.g. `total.sum()`) disabled by default (`PGRST123`), which is a project-level dashboard setting, not something this app can turn on for you. The fallback fetches only the `total` column (not full order rows) for non-cancelled orders and sums it in JS — efficient relative to fetching whole orders, but it will not scale as gracefully as a real aggregate at very high order volumes.
- No image upload — image management is URL-based, matching the existing Phase 7 architecture (no Storage bucket configured in this project).
- No audit log beyond the existing `updated_at` timestamps.

## 14. Production deployment (Phase 12)

This section documents how to take the app live. Nothing in it claims a live production deployment already exists — creating the Vercel project, pushing to GitHub, configuring a custom domain, and promoting the first production admin are all manual steps only you can perform (they require your own Vercel/GitHub/Supabase accounts and credentials). What follows is a checklist plus the reasoning behind each step.

### 14.1 Git repository

The full project (Phases 2–11) is committed on `main` as of this phase. `.gitignore` already excludes `.env*` (except `.env.example`), `.next/`, `node_modules/`, `.vercel`, and `*.tsbuildinfo` — no secrets are tracked. Push the branch to a GitHub remote yourself (`git remote add origin <your-repo-url>` then `git push -u origin main`); this was intentionally left for you to do rather than done automatically.

### 14.2 Vercel project setup

1. In the Vercel dashboard, "Add New… → Project" and import the GitHub repository once it's pushed.
2. Framework preset: Next.js (auto-detected). No custom build/install command is needed — `npm install` and `npm run build` (Vercel's defaults) are correct as-is; no `vercel.json` is required for this app.
3. Node.js version: this project declares `"engines": { "node": ">=20.9.0" }` in `package.json` (required by Next.js 16.3.4). Vercel reads this automatically; no manual Node version setting is needed unless your team's Vercel project has an older default pinned.

### 14.3 Environment variables (set in Vercel → Project Settings → Environment Variables)

| Variable | Value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Public |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` (placeholder — use your real production URL) | Used for `metadataBase` (canonical/OG URL resolution). Falls back to `http://localhost:3000` only when unset, which is correct for local dev and must not be relied on in production. |
| `SUPABASE_SERVICE_ROLE_KEY` | Only if you intend to run `scripts/seed.ts` against production — most teams should NOT set this in Vercel at all, since the running app never needs it. | **Secret.** Do not set as a client-exposed variable; never prefix with `NEXT_PUBLIC_`. |

Set each for the "Production" environment (and "Preview" too, pointed at a separate non-production Supabase project, if you want preview deployments to have working data).

### 14.4 Supabase production configuration

This project has been developed and tested throughout against one real Supabase project (`ntjanhpuglrskdbyydwv`). That is the project used for every RLS/authorization/order-flow verification referenced elsewhere in this README — it has not been treated as a separate, freshly-provisioned "production" instance distinct from development. Before going live, decide explicitly whether to:

- **(a)** continue using that same project as production, or
- **(b)** provision a new Supabase project for production and re-run the migrations there.

Either way:

1. Run all four migrations in `supabase/migrations/` in order (Dashboard SQL Editor, or `npx supabase db push` against a linked project).
2. In Supabase → Authentication → URL Configuration, set **Site URL** and **Redirect URLs** to your real production domain (`https://your-domain.com`). Leaving these pointed at `localhost` will break password-reset and auth-callback links in production.
3. Promote your own account to admin using the SQL documented in §13 ("Initial admin setup") — there is no UI for this, by design.

### 14.5 Custom domain

1. Vercel → Project → Settings → Domains → add `your-domain.com`.
2. Vercel provides the exact DNS records to add (an `A`/`ALIAS` record or `CNAME`, depending on whether it's an apex domain or subdomain) — add those at your DNS registrar.
3. Vercel provisions a TLS certificate automatically once DNS propagates; no manual HTTPS configuration is needed. DNS propagation and certificate issuance happen outside this codebase and cannot be verified here — check `https://your-domain.com` in a browser yourself once DNS has propagated.
4. Update `NEXT_PUBLIC_SITE_URL` (Vercel env var) and the Supabase Auth URL configuration (§14.4) to match the final domain.

### 14.6 Security headers

`next.config.ts` now sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive `Permissions-Policy` on every route. A `Content-Security-Policy` is deliberately not included: a CSP strict enough to matter can silently break Supabase API calls, `next/image`-optimized images, or web fonts, and that combination hasn't been tested against a live deployment. Add one deliberately later, tested against your real production traffic.

### 14.7 Rollback plan

- **Application**: Vercel keeps every deployment; use Vercel → Deployments → "Promote to Production" on a previous deployment to roll back instantly if a release misbehaves. No destructive action is needed.
- **Database**: prefer a forward-fix (a new migration that corrects the issue) over reverting a migration, since reverting can drop columns/data other rows now depend on. If a migration must be undone, take a Supabase backup/snapshot immediately before running any destructive rollback SQL, and never run `DROP`/destructive rollback statements without one.

### 14.8 Monitoring (recommended, not implemented)

Nothing beyond application logs is wired up today. Recommended, using tools already available in your Vercel/Supabase plan rather than adding a new dependency:

- **Vercel** → Deployments/Observability: build failures and runtime errors on serverless functions are visible here by default.
- **Supabase Dashboard** → Database/Auth/Logs: query performance, failed-auth attempts, and API error rates.
- Optionally, watch for orders stuck in `payment_status = 'pending'` for an unusual length of time (a query, not a new feature) as an early signal of a checkout-flow problem.

### 14.9 Pre-launch checklist

- [x] `npx tsc --noEmit` — passes
- [x] `npm run lint` — passes
- [x] `npm run format:check` — passes
- [x] `npm run build` — passes (all routes compile, 40 static pages generated)
- [x] `npm audit` — 0 vulnerabilities
- [x] Working tree committed to git (`main`, no secrets tracked)
- [ ] Pushed to a GitHub remote — **you** need to do this
- [ ] Vercel project created and env vars set — **you** need to do this
- [ ] Supabase Auth redirect URLs updated to the production domain — **you** need to do this
- [ ] Custom domain DNS configured and verified live in a browser — **you** need to do this
- [ ] First production admin promoted via SQL — **you** need to do this

## 15. Troubleshooting

- **"Invalid `metadataBase`" or broken Open Graph URLs in production** — `NEXT_PUBLIC_SITE_URL` isn't set in Vercel's environment variables (§14.3). It's the only source `metadataBase` reads besides the `localhost` dev fallback.
- **Password reset / magic link redirects to `localhost` or errors out in production** — Supabase's Auth "Site URL"/"Redirect URLs" (§14.4) still point at a dev URL. Update them to your production domain.
- **A logged-in customer can view `/admin` and gets a 404** — this is intentional, not a bug: non-admin visitors to any `/admin/*` route get a plain 404 rather than an "Access Denied" page, so the route's existence isn't disclosed (see §13, "Role architecture").
- **New products/categories don't appear on the storefront** — check `is_active` on the row; only active rows are visible to the public `anon` key under RLS (§5).
- **"Total Order Value" or other aggregate queries fail with `PGRST123`** — this Supabase project has PostgREST's aggregate `select` syntax (e.g. `total.sum()`) disabled at the project level; the dashboard already works around this by summing in application code (§13, "Known limitations"). This isn't something app code can toggle — it's a Supabase project setting.
- **A direct `PATCH` to `/rest/v1/profiles` setting `role` is rejected with `42501 permission denied`** — expected behavior, not a misconfiguration; `role` is intentionally excluded from the columns `authenticated` users may update (§13, "Role architecture").
- **`npm run build` fails locally but not in CI, or vice versa** — confirm your local Node version satisfies the `"engines"` constraint in `package.json` (`>=20.9.0`, required by Next.js 16.3.4).

## Project structure

```
src/
  app/                    Next.js App Router routes
  components/             UI, layout, product, cart, wishlist components
  context/                CartContext, WishlistContext, ToastContext
  data/                   Mock catalog (categories, products, reviews) — the fallback data source
  lib/
    services/             categoryService, productService, reviewService, settingsService, orderService
      admin/               dashboardService, adminProductService, adminCategoryService, adminOrderService, adminCustomerService, adminSettingsService
    checkout/              shipping.ts, getShippingSettings.ts, paymentMethods.ts, validation.ts
    admin/                 searchParams.ts, slug.ts — shared admin list/form helpers
    auth/                  requireAdmin.ts, getCurrentUserRole.ts (alongside the existing Phase 8 helpers)
    supabase/              client.ts (browser), server.ts (server), mappers.ts, env.ts
    products.ts, reviews.ts, cart.ts   Pure helpers shared by both data-source modes
  types/                  Product/Category/Review app types, plus supabase.ts (DB types)
supabase/
  migrations/             SQL schema
scripts/
  seed.ts                 Local-only seed script (needs the service_role key)
```
