# Security and Quality Audit Report: Mushida-Craft

> **Status: AKTIF — audit dijalankan ulang pada 2026-08-07.**
> Dokumen ini mencerminkan hasil verifikasi kode + tooling yang benar-benar dijalankan,
> bukan klaim statis. **Temuan dependency vulnerabilities sudah diperbaiki** (lihat §7).

---

## Executive Summary

Mushida-Craft menerapkan standar keamanan yang tinggi: arsitektur auth berlapis, validasi input ketat,
RLS di semua tabel database, upload dengan verifikasi magic bytes, rate limiting terdistribusi, dan
praktik defensive programming yang konsisten. Audit ini memverifikasi ulang seluruh klaim dari kode.

**Hasil verifikasi aktual (2026-08-07):**

| Pemeriksaan | Hasil | Bukti |
|-------------|-------|-------|
| `npm audit` (semua deps) | ✅ **0 vulnerabilities** | dijalankan ulang setelah fix |
| `tsc --noEmit` | ✅ 0 error | dijalankan ulang |
| ESLint | ✅ 0 error/warning | dijalankan ulang |
| Vitest (unit test) | ✅ 9/9 passed | dijalankan ulang |
| `npm run build` | ✅ sukses, semua route ter-generate | dijalankan ulang |
| Scan git history untuk secrets | ✅ bersih | `git log -S SUPABASE_SERVICE_ROLE_KEY` dst. |

> ⚠️ **Catatan penting:** Audit sebelumnya (versi dokumen ini yang lama) melaporkan "0 vulnerabilities"
> dari `npm audit`. **Itu sudah tidak akurat**: audit aktual menemukan 4 vulnerabilities
> (1 moderate, 3 high) di transitive dependencies — semuanya sudah diperbaiki via `npm audit fix`
> (lihat §7). Pelajaran: hasil audit statis basi; keandalan dijaga dengan CI gate (lihat §8).

---

## 1. Static Analysis & Dependencies

* **NPM Audit**: sebelumnya 4 vuln (1 moderate, 3 high) — **sudah diperbaiki**, sekarang 0.
  Detail: §7.
* **ESLint**: `eslint.config.mjs` strict (Next + typescript-eslint). 0 error, 0 warning.
* **TypeScript**: `tsc --noEmit` bersih, 0 error.
* **Unit test**: Vitest 9/9 lulus (session-token: create/verify/tamper/expiry/clock-skew/shape).
* **Build produksi**: `npm run build` sukses; seluruh route + proxy (middleware) ter-generate.

## 2. Session Authentication & Authorization

* **Custom Admin Auth** (bukan Supabase Auth): stateless HMAC-SHA256 session token
  (`payload.signature`) via Web Crypto — kompatibel Edge middleware + Node runtime.
* **Verifikasi constant-time**: `crypto.subtle.verify`, plus regex ketat pada format token
  (hanya `[A-Za-z0-9_-]`), shape-check payload, dan **penolakan clock-skew** (`loggedAt` masa depan).
* **Cookie** `Mushida:admin-session`: `httpOnly`, `sameSite=lax`, `secure` di production,
  `maxAge` 3 hari (bukan 7 — window curian lebih kecil).
* **Edge Proxy guard**: `src/proxy.ts` (Next.js 16; pengganti `middleware.ts`) memblokir
  `/admin/*` tanpa sesi valid sebelum request mencapai server. Login redirect ke `/admin` jika sudah authed.
* **Defense in depth**: setiap API write (POST/PATCH/DELETE) re-check `isAdminAuthenticated()`.
* **CSRF**: `isTrustedOrigin` memvalidasi `Origin`/`Referer` terhadap host; bila header tidak ada,
  andalkan SameSite=Lax + auth cookie.

## 3. Database Security & Supabase Schema

* **RLS enabled di semua tabel**:
  * `products` — public SELECT (all); write hanya service role.
  * `categories` — public SELECT hanya `is_active = true`; write service role.
  * `testimonials` — public SELECT hanya `status = 'approved'`; submit publik via API
    rate-limited (service role), moderasi admin.
  * `inquiries` — **tanpa policy public sama sekali**; insert/list hanya service role.
* **Storage**: bucket `product-images` public-read, tulis hanya service role;
  `file_size_limit` 5 MB + `allowed_mime_types` di level bucket.
* **Service role key** hanya server-side (`getServerSupabaseClient`), tidak pernah ke browser.

## 4. Input Validation & Abuse Prevention

* **Zod strict** di semua endpoint (panjang string, tipe angka, enum kategori, format slug).
* **JSONB spam protection**: `meta` inquiry dibatasi primitif + maks 12 key.
* **Upload aman**: ukuran ≤5 MB (produk) / 1 MB (avatar), **magic bytes diverifikasi**
  (JPEG `FFD8FF`, PNG 8-byte, WebP `RIFF....WEBP`, AVIF `ftyp`), MIME + ekstensi dikunci,
  rollback otomatis bila sebagian upload gagal.
* **Rate limiting** (Upstash Redis prod / Map in-memory dev):
  login 5/15 menit/IP, testimoni 3/jam/IP, inquiry 30/jam/IP.
  `GET /api/health` jujur melaporkan mode `degraded` bila production tanpa Upstash.

## 5. Code Quality & Defensive Coding

* **Production guard saat boot** (`instrumentation.ts`): tolak ADMIN_EMAIL kosong,
  ADMIN_PASSWORD lemah (<12 char / di daftar default), SESSION_SECRET <32 char.
* **Timing-safe credential compare** (`timingSafeEqual` atas hash SHA-256).
* **HTML escape** pada notifikasi email (Resend) — cegah HTML injection di inbox admin.
* **Error handling**: log detail di server, respons generik ke client (tidak bocor stack/config).
* **Seed fallback bijak**: fallback seed hanya saat DB gagal/unconfigured;
  query sukses-kosong dihormati (tidak resurrect data palsu ke homepage).
* **safeJsonLd**: escape `</script>`/`<!--` pada JSON-LD.

## 6. Deployment Configuration

* **Security headers** (dua lapis: `next.config.mjs` headers + `vercel.json`):
  `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Permissions-Policy`, HSTS (2 tahun + preload), CSP ketat.
* **CSP**: `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`,
  `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests`;
  img/connect dibatasi (Unsplash, Supabase, Sentry); PostHog via proxy same-origin `/ingest`.
* **next/image**: remotePatterns dibatasi (Unsplash + hostname Supabase + path bucket produk).
* **Secrets hygiene**: `.gitignore` menutup `.env*`; hanya `.env.example` ter-track;
  scan history bersih dari service role key / credential.

## 7. ⚠️ Dependency Vulnerabilities — Ditemukan & Diperbaiki (2026-08-07)

Audit aktual menemukan **4 vulnerabilities** yang TIDAK terdeteksi dokumen lama:

| Paket | Severity | Advisory | Jalur |
|-------|----------|----------|-------|
| `brace-expansion` ≤1.1.17 / 5.0.8 | 🔴 high | DoS OOM (GHSA-mh99-v99m-4gvg, GHSA-rgw5-rvv9-x895) | eslint / minimatch (dev tooling) |
| `fast-uri` 3.0.0–3.1.4 | 🔴 high | Host confusion via backslash (GHSA-7p8r-x3mc-p8w7) | @sentry/nextjs → webpack → ajv |
| `js-yaml` ≤4.3.0 | 🔴 high | Quadratic CPU (CVE-2026-59870) | eslint |
| `dompurify` ≤3.4.12 | 🟠 moderate | XSS via detached subtree (GHSA-55q2-fjhq-7xh7) | posthog-js |

**Perbaikan:** `npm audit fix` — hanya bump versi patch transitive di `package-lock.json`
(fast-uri 3.1.5, brace-expansion 1.1.18/5.0.9, js-yaml 4.3.1, dompurify 3.4.13).
**Tidak ada dependency langsung yang berubah.** Setelah fix: audit 0 vuln, test 9/9, type-check & build tetap sukses.

> Semua paket di atas transitive dari tooling; dampak runtime ke aplikasi rendah, namun
> tetap ditutup karena prinsip zero-known-vulnerability & murahnya fix.

## 8. CI/CD — Security Gate

Workflow `.github/workflows/ci.yml` menjalankan di setiap push/PR ke `master`:
type-check + lint (`npm run verify`), unit test (`npm test`), build, dan **audit gate**.

**Perubahan 2026-08-07:** job `security-audit` di-upgrade dari `npm run audit:ci`
(`npm audit --omit=dev --audit-level=high`, yang **exit 0** meski dev-tooling vulnerable)
menjadi **hard gate** `npm audit --audit-level=moderate` (tanpa `--omit`) —
**exit non-zero bila ada vulnerability apa pun** (prod maupun dev).

> **Pelajaran:** gate lama lolos meski 4 vuln ada. Gate baru sudah diverifikasi:
> exit 1 pada lockfile vulnerable, exit 0 pada lockfile bersih.

## 9. Rekomendasi & Next Steps

1. **Jaga lockfile tetap bersih** — selalu `npm audit fix` (atau dependabot) sebelum merge;
   CI gate baru akan memaksa.
2. **CSP hardening opsional** — hilangkan `'unsafe-eval'` dari `script-src` di production
   bila memungkinkan (perlu tes dengan Next/Sentry/PostHog).
3. **`getClientIp()`** — header `x-forwarded-for` di-trust; aman di Vercel (di-set platform),
   tapi perlu trust-proxy jika pindah hosting.
4. **Cakupan test** — unit test session-token sudah ada; tambahkan: magic-bytes upload
   (produk + avatar) dan rate-limiter (in-memory + Upstash mock).
5. **Perbarui CLAUDE.md** — referensi `src/middleware.ts` → `src/proxy.ts` (Next 16).
6. **Jangan biarkan dokumen ini basi** — audit statis kedaluwarsa; andalkan CI gate (§8)
   sebagai sumber kebenaran, dan perbarui dokumen ini saat ada perubahan signifikan.

---

*Terakhir diperbarui: 2026-08-07 · Verifikasi: tooling dijalankan langsung pada tanggal tersebut.*
