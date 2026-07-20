# Mushida-Craft

Web katalog bouquet bunga premium dengan halaman publik (beranda, katalog, detail produk, custom order) dan admin dashboard untuk mengelola produk. Order dilakukan via WhatsApp. Dibangun dengan Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, dan Supabase sebagai backend database.

## ✨ Fitur

- **Beranda** — hero, section kategori, produk unggulan (best-seller dari Supabase), testimoni, alur pemesanan.
- **Katalog** (`/katalog`) — filter berdasarkan kategori, rentang harga, dan pencarian teks. Data dibaca dari Supabase via API route.
- **Detail produk** (`/produk/[slug]`) — galeri gambar, info produk, order via WhatsApp, produk terkait. Produk default di-prerender (SSG) untuk SEO; produk admin di-render on-demand dari Supabase.
- **Custom order** (`/custom-order`) — form request bouquet custom, validation dengan Zod, pesan dibuat otomatis dan dikirim ke WhatsApp.
- **Admin dashboard** (`/admin/dashboard`) — CRUD produk dan pengelolaan multi-gambar dari device/URL ke Supabase, autentikasi via env credentials + HTTP-only cookie session.
- **SEO** — `robots.ts`, `sitemap.xml` dinamis (dari Supabase + fallback seed), JSON-LD (`Store` & `Product`), metadata + OpenGraph per halaman.
- **Error tracking** — integrasi Sentry (server + client + upload source maps), no-op jika DSN kosong.

## 🛠️ Tech Stack

| Layer | Teknologi |
|------|----------|
| Framework | Next.js 16.2 (App Router) + React 19.2 |
| Bahasa | TypeScript 5.9 |
| Styling | Tailwind CSS 4.3 + CSS variables |
| UI components | shadcn/ui, Radix UI, lucide-react |
| Form & validation | react-hook-form + Zod |
| Database | Supabase (PostgreSQL + RLS) |
| Animasi | framer-motion |
| Error tracking | @sentry/nextjs |
| Analytics | posthog-js |
| Font | Inter (sans) + Playfair Display (serif) via `next/font` |

## 📁 Struktur Project

```
src/
├── app/
│   ├── (publik)
│   │   ├── page.tsx                  # Beranda
│   │   ├── katalog/page.tsx          # Katalog produk
│   │   ├── produk/[slug]/page.tsx    # Detail produk (SSG + client)
│   │   └── custom-order/page.tsx     # Form custom order
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── page.tsx                  # Redirect ke login/dashboard
│   ├── api/admin/
│   │   ├── login/route.ts            # API login (set HTTP-only cookie)
│   │   ├── logout/route.ts           # API logout (hapus cookie)
│   │   ├── session/route.ts          # Cek status sesi admin
│   │   └── products/
│   │       ├── route.ts              # GET list / POST create / POST reset
│   │       └── [id]/route.ts         # PATCH update / DELETE remove
│   ├── layout.tsx                   # Root layout (navbar, footer, FAB, toaster)
│   ├── error.tsx                    # Error boundary (route)
│   ├── global-error.tsx             # Error boundary (root layout) → Sentry
│   ├── not-found.tsx                # 404
│   ├── loading.tsx                  # Loading fallback
│   ├── robots.ts                    # robots.txt
│   └── sitemap.ts                   # sitemap.xml dinamis
├── components/
│   ├── analytics/                   # posthog provider
│   ├── ui/                          # shadcn/ui primitives
│   ├── layout/                      # navbar, footer
│   ├── home/                        # hero, kategori, featured, testimoni
│   ├── product/                     # card, grid, gallery, order button, detail
│   ├── catalog/                     # filters, view, empty state
│   ├── custom-order/                # custom order form
│   ├── admin/                       # dashboard, login form, product form/table
│   └── common/                      # section heading, toaster, whatsapp FAB
├── data/                            # Seed data statis (products, categories, testimonials)
├── lib/                             # utils, auth, supabase, product-store, product-api, validations, whatsapp
├── hooks/                           # use-products, use-toast
└── types/                           # Type definitions
```

## 🚀 Quick Start

### Prasyarat

- Node.js 20.9+ (disarankan Node.js 24 LTS)
- npm

### Instalasi

```bash
# 1. Clone repo
git clone <repo-url>
cd Mushida-Craft

# 2. Install dependencies
npm install

# 3. Salin env file & isi nilai
cp .env.example .env.local
```

### Konfigurasi environment

Edit `.env.local`:

```env
# Nomor WhatsApp tujuan order (format internasional tanpa "+", contoh: 6281234567890)
NEXT_PUBLIC_WHATSAPP_NUMBER=6285713254800

# Kredensial admin dashboard
ADMIN_EMAIL=mushidacraft@gmail.com
ADMIN_PASSWORD=changeme123
SESSION_SECRET=ganti-dengan-secret-acak-yang-kuat

# URL produksi situs (untuk SEO & metadata)
NEXT_PUBLIC_SITE_URL=https://mushida-craft.vercel.app

# ── Supabase (backend database produk) ──
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx        # RAHASIA — server only

# ── Sentry (opsional — kosongkan untuk menonaktifkan error tracking) ──
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# ── PostHog (analytics — opsional, kosongkan untuk menonaktifkan) ──
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Menjalankan

```bash
# Development
npm run dev          # http://localhost:3000

# Production build
npm run build
npm run start

# Cek tipe
npm run type-check

# Lint
npm run lint
```

## 🗄️ Supabase Setup (Backend Database)

Data produk disimpan di Supabase (PostgreSQL). Berikut cara setup:

### 1. Buat project Supabase

1. Daftar/login di [supabase.com](https://supabase.com)
2. Buat project baru → pilih region terdekat
3. Tunggu hingga project siap

### 2. Jalankan SQL migration (otomatis)

Cara paling cepat — pakai script built-in:

1. Dapatkan **connection string** di **Dashboard > Project Settings > Database > Connection string > URI**
2. Set di `.env.local`:
   ```env
   SUPABASE_DB_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres
   ```
3. Jalankan:
   ```bash
   npm run db:setup
   ```

Script ini membaca seluruh file `.sql` di `supabase/migrations/` sesuai urutan nama dan menjalankannya ke database Supabase. Pada database existing, bootstrap `0001_products.sql` dilewati jika tabel produk sudah ada agar data admin tidak di-reset. Migration membuat tabel `products`, RLS produk, serta bucket publik `product-images` dengan batas file dan policy Storage.

<details>
<summary>Alternatif: jalankan SQL manual</summary>

1. Buka **Supabase Dashboard > SQL Editor**
2. Untuk database baru, jalankan sesuai urutan nama: [`0001_products.sql`](supabase/migrations/0001_products.sql), lalu [`0002_product_images_storage.sql`](supabase/migrations/0002_product_images_storage.sql). Untuk database existing yang sudah memiliki produk, jalankan hanya `0002_product_images_storage.sql`.
3. Klik **Run** untuk setiap file
</details>

### 3. Dapatkan API keys

Buka **Project Settings > API** dan ambil:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (RAHASIA!)

### 4. Set environment variables

Isi `.env.local` dengan ketiga nilai di atas (lihat `.env.example`).

### Storage gambar produk

Migration `0002_product_images_storage.sql` membuat bucket publik `product-images`. Gambar dapat dibaca publik agar katalog dan `next/image` dapat menampilkannya, sedangkan upload/update/delete objek hanya dilakukan API server dengan service role.

- Format upload: JPEG, PNG, WebP, atau AVIF.
- Ukuran maksimal: 5 MB per file.
- Maksimal 10 gambar per produk/upload.
- `NEXT_PUBLIC_SUPABASE_URL` harus tersedia saat build agar hostname Storage masuk ke allowlist `next/image`.

### Arsitektur akses data

| Operasi | Client | Key | RLS |
|---------|--------|-----|-----|
| Public read (katalog, detail, homepage, sitemap) | Browser/server | anon | SELECT only |
| Admin write (create/update/delete) | API route (server) | service_role | Bypass RLS |
| Public read gambar produk | Browser/`next/image` | Public URL | Public bucket |
| Admin upload gambar produk | API route (server) | service_role | Bypass RLS |

### API Routes

| Endpoint | Method | Akses | Deskripsi |
|----------|--------|-------|-----------|
| `/api/admin/products` | GET | Public | List semua produk |
| `/api/admin/products?slug=xxx` | GET | Public | Ambil produk by slug |
| `/api/admin/products` | POST | Admin | Buat produk baru / reset seed |
| `/api/admin/products/[id]` | PATCH | Admin | Update produk |
| `/api/admin/products/[id]` | DELETE | Admin | Hapus produk |
| `/api/admin/upload` | POST | Admin | Upload multi-gambar ke Supabase Storage |
| `/api/admin/login` | POST | Public | Login admin (set cookie) |
| `/api/admin/logout` | POST | Admin | Logout (hapus cookie) |
| `/api/admin/session` | GET | Public | Cek status sesi admin |

> **Catatan:** Tanpa env Supabase, aplikasi masih bisa build (server components & sitemap fallback ke seed statis). Runtime reads/writes akan error jika tabel belum dibuat.

## 🔐 Admin Dashboard

1. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, dan `SESSION_SECRET` di `.env.local`.
2. Buka `/admin` → otomatis redirect ke `/admin/login`.
3. Login dengan kredensial di env → API route set HTTP-only cookie sesi.
4. Di dashboard, kamu bisa: tambah produk, upload atau tempel beberapa URL gambar, mengatur urutan/gambar utama, edit, hapus, atau reset data ke seed.

> **Arsitektur:** Login admin memakai env credentials (bukan Supabase Auth). Sesi disimpan di HTTP-only cookie yang ditandatangani HMAC-SHA256 (dibaca server untuk verifikasi API routes). Data produk disimpan di Supabase — admin writes lewat API route dengan service role key, public reads lewat anon key (RLS enforced).

> **Catatan Next.js 16:** `cookies()` adalah API async, sehingga seluruh akses cookie server harus memakai `await cookies()`.

## 📊 Sentry (Error Tracking)

Integrasi Sentry aktif bila `NEXT_PUBLIC_SENTRY_DSN` terisi. Jika kosong, SDK no-op (tidak mengirim apa-apa) — aman untuk dev/CI.

**Cakupan:**
- **Server-side** — error di API routes, server components, server actions
- **Client-side** — error React, browser exceptions
- **Source maps** — auto-upload saat build jika `SENTRY_AUTH_TOKEN` tersedia

**File konfigurasi:**
- `src/instrumentation-client.ts` — init SDK browser (pengganti `sentry.client.config.ts`)
- `sentry.server.config.ts` — init SDK server (Node)
- `src/instrumentation.ts` — hook Next.js startup → panggil server config
- `next.config.mjs` — wrap config dengan `withSentryConfig`

**Mengaktifkan:**
1. Buat project Next.js di [sentry.io](https://sentry.io)
2. Isi `.env.local`:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@oXXXXX.ingest.sentry.io/XXXXX
   SENTRY_AUTH_TOKEN=sntrys_xxx      # untuk upload source maps
   SENTRY_ORG=your-org
   SENTRY_PROJECT=your-project
   ```
3. Deploy — error mulai ter-track otomatis.

## 📈 PostHog (Analytics)

Integrasi PostHog aktif bila `NEXT_PUBLIC_POSTHOG_KEY` terisi. Jika kosong, SDK no-op — aman untuk dev/CI.

**Cakupan:**
- **Pageviews** — otomatis track setiap route change
- **Auto-capture** — clicks, input changes, form submissions
- **Session replay** — recording screen untuk analisis UX

**File konfigurasi:**
- `src/components/analytics/posthog-provider.tsx` — init SDK + pageview tracking
- `src/app/api/posthog/ingest/route.ts` — proxy route (mengatasi ad-blocker)

**Mengaktifkan:**
1. Buat project di [posthog.com](https://posthog.com)
2. Isi `.env.local`:
   ```env
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com   # atau https://eu.i.posthog.com
   ```
3. Deploy — analytics mulai ter-track otomatis.

## 📝 Scripts

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Jalankan dev server |
| `npm run build` | Build production |
| `npm run start` | Jalankan production server |
| `npm run lint` | Jalankan ESLint |
| `npm run type-check` | Cek tipe TypeScript (`tsc --noEmit`) |
| `npm run db:setup` | Jalankan SQL migration ke Supabase (butuh `SUPABASE_DB_URL`) |

## 🚀 Deployment ke Vercel

Project ini siap deploy ke Vercel. Vercel auto-detect Next.js, jadi tidak perlu konfigurasi build manual.

### Prasyarat

- Repo GitHub (push kode ke GitHub)
- Project Supabase sudah dibuat & migration sudah dijalankan (`npm run db:setup`)
- (Opsional) Project Sentry untuk error tracking

### Step-by-step

1. **Push ke GitHub**
   ```bash
   git remote add origin https://github.com/username/Mushida-Craft.git
   git push -u origin master
   ```

2. **Import project di Vercel**
   - Buka [vercel.com/new](https://vercel.com/new)
   - Pilih repo GitHub Anda
   - Vercel akan auto-detect sebagai Next.js project
   - Framework preset: **Next.js** (otomatis)
   - Build command: `next build` (otomatis)
   - Output directory: `.next` (otomatis)

3. **Set Environment Variables**

   Di Vercel Dashboard > project Anda > **Settings > Environment Variables**, tambahkan:

   | Variable | Scope | Wajib? |
   |----------|-------|--------|
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | All | ✅ |
    | `ADMIN_EMAIL` | All | ✅ |
    | `ADMIN_PASSWORD` | All | ✅ |
    | `SESSION_SECRET` | All | ✅ (sensitive — server only) |
   | `NEXT_PUBLIC_SITE_URL` | Production | ✅ (set ke URL Vercel Anda) |
   | `NEXT_PUBLIC_SUPABASE_URL` | All | ✅ |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | ✅ |
   | `SUPABASE_SERVICE_ROLE_KEY` | All | ✅ (sensitive — jangan di-expose) |
   | `NEXT_PUBLIC_SENTRY_DSN` | All | Opsional |
   | `SENTRY_AUTH_TOKEN` | All | Opsional (untuk source maps) |
   | `SENTRY_ORG` | All | Opsional |
   | `SENTRY_PROJECT` | All | Opsional |
   | `NEXT_PUBLIC_POSTHOG_KEY` | All | Opsional |
   | `NEXT_PUBLIC_POSTHOG_HOST` | All | Opsional (default: `https://us.i.posthog.com`) |

   > **Catatan:** `SUPABASE_DB_URL` tidak perlu di-set di Vercel — hanya dipakai lokal oleh `npm run db:setup`.

4. **Deploy**
   - Klik **Deploy**
   - Tunggu build selesai (~1-2 menit)
   - Akses via `https://your-project.vercel.app`

5. **Custom Domain (opsional)**
   - Vercel Dashboard > Settings > Domains
   - Tambah domain Anda
   - Update `NEXT_PUBLIC_SITE_URL` ke domain custom

### Konfigurasi file

| File | Fungsi |
|------|--------|
| `vercel.json` | Security headers (X-Frame-Options, Referrer-Policy, dll), cache untuk static assets |
| `.vercelignore` | File yang tidak perlu di-deploy (`supabase/`, `scripts/`, `.env.example`) |

### Troubleshooting

<details>
<summary>Build gagal di Vercel</summary>

- Pastikan semua env vars wajib sudah di-set (lihat tabel di atas)
- Cek build log di Vercel Dashboard > Deployments > klik deployment yang gagal
- Jalankan `npm run build` lokal untuk reproduce error
</details>

<details>
<summary>Produk tidak muncul di katalog</summary>

- Pastikan migration Supabase sudah dijalankan: `npm run db:setup` (lokal)
- Cek `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah benar
- Buka browser console untuk error
</details>

<details>
<summary>Admin login gagal</summary>

- Pastikan `ADMIN_EMAIL` & `ADMIN_PASSWORD` sudah di-set di Vercel env vars
- Clear cookies browser lalu coba lagi
</details>

## 📄 License

MIT — lihat file [LICENSE](LICENSE).
