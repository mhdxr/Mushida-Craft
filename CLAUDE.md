# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mushida-Craft — premium flower bouquet catalog. Public pages (home, catalog, product detail, custom order) + an admin dashboard for product CRUD. Orders are placed via WhatsApp deep links, not an internal cart/checkout. Next.js 16 (App Router) + React 19, TypeScript, Tailwind 4, shadcn/ui, Supabase (Postgres) backend.

Code comments and UI copy are in Indonesian — match that when editing.

## Commands

```bash
npm run dev          # dev server → http://localhost:3000
npm run build        # production build (runs Sentry source-map upload if SENTRY_AUTH_TOKEN set)
npm run start        # serve production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit — run this to verify types; there is no test suite
npm run db:setup     # apply supabase/migrations/*.sql (needs SUPABASE_DB_URL)
```

No test framework is configured. Verify changes with `npm run type-check` + `npm run lint`.
Path alias: `@/*` → `src/*`.

## Architecture

### Data access — two Supabase clients, never mix them

`src/lib/supabase.ts` exposes two factories; picking the wrong one is the most common source of bugs:

- **`getBrowserSupabaseClient()`** — anon key, RLS enforced (**SELECT only**). Use for all public reads (catalog, detail, homepage, sitemap). Safe in browser, Server Components, and API routes.
- **`getServerSupabaseClient()`** — service role key, **bypasses RLS**. Server-only. Use for admin writes (create/update/delete). Never let the service role key reach the browser.

`src/lib/product-api.ts` is the single gateway to the `products` table: public read functions (`fetchProducts`, `fetchProductBySlug`, `fetchFeaturedProducts`, `fetchAllSlugs`) use the browser client; write functions (`createProduct`, `updateProduct`, `deleteProduct`, `resetProducts`) use the server client. DB rows are snake_case; `rowToProduct`/`productToRow` in `product-store.ts` map to/from the camelCase `Product` type. Analogous split exists for testimonials (`testimonial-api.ts`).

### Seed fallback

`src/data/` holds static seed data (products, categories, testimonials). API routes and `sitemap.ts` fall back to seed when Supabase is unconfigured or throws, so the app builds and renders without a live DB (runtime writes still fail). Preserve this fallback pattern when touching data routes.

### Admin auth — NOT Supabase Auth

Admin login uses env credentials (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), not Supabase Auth. Session = an HMAC-SHA256-signed token in an HTTP-only cookie (`Mushida:admin-session`, 7-day expiry).

- `src/lib/session-token.ts` — pure token create/verify via Web Crypto (works in **both** Edge and Node runtimes). Keep it dependency-free of `next/headers` so middleware can use it.
- `src/lib/auth.ts` — server-side cookie read/write (`next/headers`). **Next 16: `cookies()` is async — always `await cookies()`.**
- `src/middleware.ts` — Edge guard over `/admin/*` (except `/admin/login`); verifies the cookie before the dashboard shell renders.
- API write routes re-check with `isAdminAuthenticated()` — defense in depth, middleware alone isn't trusted.
- `src/lib/rate-limit.ts` — login (5/15min per IP) and testimonial submit (3/hr per IP) limits. Prefers Upstash Redis; falls back to in-memory `Map` (per-process, not distributed) when Upstash env is absent.

### API routes (`src/app/api/admin/`)

`products/route.ts` (GET list/by-slug public; POST create + `{action:"reset"}` admin), `products/[id]/route.ts` (PATCH/DELETE admin), `upload/route.ts` (multi-image upload to Supabase Storage, admin), plus `login`/`logout`/`session`. Bodies validated with Zod (`src/lib/validations.ts`).

### WhatsApp ordering

`src/lib/whatsapp.ts` builds `wa.me` deep links and message bodies (product order, custom order, default inquiry). Phone numbers are normalized to international digits (Indonesian `08…`/`8…` → `62…`). Target number from `NEXT_PUBLIC_WHATSAPP_NUMBER`, with a hardcoded fallback.

### Product images

Stored in the public Supabase Storage bucket `product-images`. `next.config.mjs` derives the allowed `next/image` remote host from `NEXT_PUBLIC_SUPABASE_URL` at build time — that env var **must be present at build** for Storage images to render. Upload constraints: JPEG/PNG/WebP/AVIF, ≤5 MB, ≤10 images per product.

### Observability (both no-op when env is empty — safe for dev/CI)

- **Sentry** — `src/instrumentation.ts` (server startup hook) → `sentry.server.config.ts`; `src/instrumentation-client.ts` (browser). Wrapped via `withSentryConfig` in `next.config.mjs`.
- **PostHog** — `src/components/analytics/posthog-provider.tsx`. Requests are reverse-proxied through `/ingest/*` rewrites in `next.config.mjs` (bypasses ad-blockers, keeps CSP `script-src 'self'`).

## Migrations

`supabase/migrations/*.sql` run in filename order via `npm run db:setup`. On an existing DB the `0001_products` bootstrap is skipped if the products table exists (so admin data isn't wiped); other migrations still apply. Migrations create tables, RLS policies, and the Storage bucket + policies.

## Conventions

- Client-side data fetching lives in hooks (`src/hooks/use-products.ts`, `use-testimonials.ts`) using `useEffect`+`setState`. Two ESLint rules are intentionally disabled for this pattern and for react-hook-form's `watch()` (see `eslint.config.mjs`) — don't re-enable them.
- Deployment is Vercel (auto-detected). Required env vars and full setup are documented in `README.md`; `SUPABASE_DB_URL` is local-only (never set on Vercel).
