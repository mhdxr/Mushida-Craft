# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mushida-Craft — premium flower bouquet catalog. Public pages (home, catalog, product detail, custom order) + an admin ops console for products and testimonial moderation. Orders are placed via WhatsApp deep links, not an internal cart/checkout. Next.js 16 (App Router) + React 19, TypeScript 5.9, Tailwind 4, shadcn/ui, Supabase (Postgres) backend.

Code comments and UI copy are in Indonesian — match that when editing.

## Commands

```bash
npm run dev          # dev server → http://localhost:3000
npm run build        # production build (Sentry source-map upload if SENTRY_AUTH_TOKEN set)
npm run start        # serve production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit — no test suite configured
npm run verify       # type-check + lint (use before commit/PR)
npm run db:setup     # apply supabase/migrations/*.sql (needs SUPABASE_DB_URL)
```

Requires **Node.js ≥ 20.9** (see `package.json` `engines` and `.nvmrc`).
Path alias: `@/*` → `src/*`.

## Architecture

### Data access — two Supabase clients, never mix them

`src/lib/supabase.ts` exposes two factories; picking the wrong one is the most common source of bugs:

- **`getBrowserSupabaseClient()`** — anon key, RLS enforced (**SELECT only**). Use for all public reads (catalog, detail, homepage, sitemap). Safe in browser, Server Components, and API routes.
- **`getServerSupabaseClient()`** — service role key, **bypasses RLS**. Server-only. Use for admin writes (create/update/delete). Never let the service role key reach the browser.

`src/lib/product-api.ts` is the single gateway to the `products` table: public reads use the browser client; writes use the server client. DB rows are snake_case; `rowToProduct`/`productToRow` in `product-store.ts` map to/from the camelCase `Product` type. Analogous split exists for testimonials (`testimonial-api.ts`).

Product mutations should call `revalidateStorefront()` (`src/lib/revalidate-storefront.ts`) so `/`, `/katalog`, and product detail stay fresh. Deleting a product also best-effort removes Storage objects under the `product-images` bucket.

### Seed fallback

`src/data/` holds static seed data (products, categories, testimonials, FAQ). API routes and `sitemap.ts` fall back to seed when Supabase is unconfigured or throws, so the app builds without a live DB (runtime writes still fail). Preserve this pattern when touching data routes.

Public testimonials: prefer **approved DB rows**. Seed is only for API/DB failure — not when the DB is healthy but empty (homepage shows an empty state instead of fake reviews). Live client poll: `TestimonialsLive` + `GET /api/testimonials`.

### Admin auth — NOT Supabase Auth

Admin login uses env credentials (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), not Supabase Auth. Session = HMAC-SHA256-signed token in an HTTP-only cookie (`Mushida:admin-session`, 7-day expiry).

- `src/lib/session-token.ts` — pure token create/verify via Web Crypto (Edge + Node). Keep free of `next/headers` so middleware can use it.
- `src/lib/auth.ts` — server cookie read/write. **Next 16: always `await cookies()`.**
- `src/middleware.ts` — Edge guard on `/admin/*` except login; authed users hitting login redirect to `/admin`.
- API write routes re-check `isAdminAuthenticated()` — defense in depth.
- `src/lib/rate-limit.ts` — login (5/15min per IP) and testimonial submit (3/hr per IP). Prefers Upstash Redis; falls back to in-memory `Map` when Upstash env is absent.

### Admin shell (ops console)

Store chrome (navbar/footer/FAB) is **hidden** on `/admin/*` via `StoreChrome`. Admin uses its own shell:

| Route | Purpose |
|-------|---------|
| `/admin/login` | Login form |
| `/admin` | Overview stats (products, pending testimonials, sold out) |
| `/admin/produk` | Product CRUD, search, category filter, stock toggle |
| `/admin/testimoni` | Moderation queue (default filter: pending) |
| `/admin/dashboard` | Redirect → `/admin` |

Shell: `src/components/admin/admin-shell.tsx` + `src/app/admin/layout.tsx`.  
Product seed reset (`POST { action: "reset" }`) is **blocked in production**.

### Public API surface (high level)

- `GET /api/products` — public list / by-slug (preferred). `GET /api/admin/products` remains a read alias.
- `GET/POST /api/testimonials` — list approved; submit pending (rate-limited)
- `POST /api/inquiries` — fire-and-forget WA lead log
- `GET /api/health` — env readiness (no secrets)
- `POST/PATCH/DELETE` under `/api/admin/*` + upload — admin only
- Admin testimonials approve/delete — revalidate homepage

Bodies validated with Zod (`src/lib/validations.ts`).

### WhatsApp ordering

`src/lib/whatsapp.ts` builds `wa.me` links and message bodies (product, custom order with occasion + delivery area, default inquiry). Phone normalize: Indonesian `08…`/`8…` → `62…`. Number from `NEXT_PUBLIC_WHATSAPP_NUMBER` + hardcoded fallback.

Delivery copy (same-day city/areas/cutoff) is env-driven via `src/lib/delivery.ts` and shown with `DeliveryNote`.

### Product images

Public Supabase Storage bucket `product-images`. `next.config.mjs` derives `next/image` remote host from `NEXT_PUBLIC_SUPABASE_URL` at **build** time. Upload: JPEG/PNG/WebP/AVIF, ≤5 MB, ≤10 images per product. Testimonial avatars use the same bucket under `testimonials/`.

### Typography

- **Body / UI / admin:** Inter (`font-sans`)
- **Headings / product names:** Cormorant Garamond (`font-serif`)

### Observability (no-op when env empty)

- **Sentry** — `src/instrumentation.ts` → `sentry.server.config.ts`; `src/instrumentation-client.ts`. Wrapped in `next.config.mjs`.
- **PostHog** — `posthog-provider.tsx` + funnel helpers in `src/lib/analytics.ts`. Proxied via `/ingest/*` rewrites.

## Migrations

`supabase/migrations/*.sql` run in filename order via `npm run db:setup`. On an existing DB, `0001_products` is skipped if `products` already exists; later migrations (storage, testimonials, avatar column) still apply. Needs `SUPABASE_DB_URL` (local only — never on Vercel).

## Conventions

- Client data fetching lives in hooks (`use-products`, `use-testimonials`) with `useEffect`+`setState`. Some ESLint rules are intentionally disabled for this and for RHF `watch()` — see `eslint.config.mjs`.
- Deploy on Vercel. Full env list: `.env.example` and `README.md`.
- CI: `.github/workflows/ci.yml` runs `npm run verify` on push/PR to `master`.
- Security headers: `vercel.json` + `next.config.mjs` `headers()` (CSP, HSTS, frame deny, nosniff).
- Health: `GET /api/health` — env readiness (`ok` | `degraded` | `error`). Production without Upstash → `degraded` (in-memory rate limits).
