# Security and Quality Audit Report: Mushida-Craft

This document provides a comprehensive summary of the security, reliability, and code quality audit conducted on the **Mushida-Craft** repository. 

---

## Executive Summary
The Mushida-Craft codebase is implemented with high security standards, clean architectural boundaries, and defensive programming practices. The application utilizes Next.js (App Router), Supabase for data storage, Upstash Redis for distributed rate-limiting, and Resend for notifications.

Key findings show:
* **0 Vulnerabilities** reported by `npm audit`.
* **0 Lint Errors/Warnings** reported by ESLint.
* **0 TypeScript Compilation Errors** (`tsc --noEmit` passed).
* **Robust session integrity** using HMAC-SHA256 signatures generated via the Edge-compatible Web Crypto API.
* **Strong defense-in-depth** measures, including CSRF Origin/Referer verification, startup-level production credential guards, Row-Level Security (RLS) on all database tables, MIME-type magic byte validation for file uploads, HTML escaping for notifications, and strict Content Security Policies (CSP).

---

## Detailed Audit Findings

### 1. Static Analysis & Dependencies
* **NPM Audit**: Tested and passed with 0 vulnerabilities detected.
* **ESLint**: Linter config is configured with strict rules (`eslint.config.mjs` extending standard Next configs with typescript parser). The code complies perfectly (0 errors, 0 warnings).
* **TypeScript Compilation**: All types are compiled and checked successfully via `tsc --noEmit`. No compiler errors or warnings.

### 2. Session Authentication & Authorization
* **Custom Admin Auth**: The admin dashboard deliberately bypasses Supabase Auth in favor of a stateless custom session token strategy to avoid user registration overhead.
* **HMAC-SHA256 Token Validation**: Session tokens are structured as `payload.signature` signed with `crypto.subtle.sign("HMAC", ...)` using SHA-256 via the Web Crypto API. This ensures constant-time verification (`crypto.subtle.verify`) and compatibility with Edge middleware.
* **Cookie Protection**: The session cookie (`Mushida:admin-session`) is configured as:
  * `httpOnly: true` (prevents XSS extraction).
  * `sameSite: "lax"` (mitigates CSRF).
  * `secure: true` (enforced in production, transport over HTTPS).
  * `maxAge: 3 days` (short expiration window).
* **Edge Middleware Guard**: `src/middleware.ts` intercepting `/admin/*` and `/api/admin/*` paths executes at the Edge, ensuring unauthenticated requests are blocked before they can reach the server endpoints or consume compute resources.
* **CSRF Protection**: All state-changing endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) enforce an origin check through a shared `isTrustedOrigin` utility, which validates the `Origin` and `Referer` headers against the configured `NEXT_PUBLIC_SITE_URL`.

### 3. Database Security & Supabase Schema
* **Row-Level Security (RLS)**: Enabled across all tables:
  * `products`: Read-only select for the public; writes restricted to the service role (accessed only by authenticated admin APIs).
  * `categories`: Read-only select for active entries; writes restricted to the service role.
  * `testimonials`: Read-only select for approved reviews; submissions via public API rate-limited; updates restricted to the service role.
  * `inquiries`: Public access (read/write) is completely disabled at the database level. Leads are created and managed strictly through the server-side API using the Supabase Service Role client (`SUPABASE_SERVICE_ROLE_KEY`).
* **Service Role Restriction**: The highly privileged `SUPABASE_SERVICE_ROLE_KEY` is kept strictly server-side. The client-side only has access to the `NEXT_PUBLIC_SUPABASE_ANON_KEY`, which is limited by RLS to SELECT queries.

### 4. Input Validation & Abuse Prevention
* **Zod Schemas**: Every API endpoint parses inputs using strict Zod schemas, enforcing types, string lengths (e.g., `z.string().max(80)`), and number constraints.
* **JSONB Spam Prevention**: The inquiry submission endpoint (`POST /api/inquiries`) limits the custom metadata object to a maximum of 12 primitive keys, protecting Postgres JSONB indexes from database bloating or Denial of Service (DoS) attacks.
* **Safe File Uploads**: The product image upload API (`POST /api/admin/products/upload`) implements defensive file verification:
  * Restricts file sizes to standard thresholds (< 3.5MB).
  * Rather than relying solely on the client-supplied content-type header, it reads the image buffer's **magic bytes** (file signature headers) to guarantee the file is a genuine image (JPEG, PNG, WEBP, or GIF), preventing the execution of malicious scripts disguised as images or XML-based SVG attacks.
* **Distributed Rate Limiting**: Implemented via Upstash Redis with sliding window limiters:
  * Login attempts: Max 5 failures per 15 minutes per IP.
  * Testimonial submissions: Max 3 per hour per IP.
  * WhatsApp inquiry logs: Max 30 per hour per IP.
  * Fallback behavior: Map-based in-memory limiter for local development, with warning diagnostics built into `GET /api/health` if production runs without Upstash Redis configured.

### 5. Code Quality & Defensive Coding
* **Production Guard**: An instrumentation hook (`src/instrumentation.ts`) executes `assertProductionAdminCredentials()` on server startup in production mode, blocking boot if `ADMIN_EMAIL` is missing, `ADMIN_PASSWORD` is weak (< 12 characters or using defaults like `admin123`), or `SESSION_SECRET` is too short (< 32 characters).
* **HTML Sanitization**: Automated email notifications sent via Resend implement a strict `escapeHtml` utility to sanitize user inputs before placing them into HTML templates, mitigating HTML injection risks in the admin's inbox.
* **Error Handling**: API errors are logged to the server, and responses return generalized, safe errors (e.g., `"Gagal menyimpan inquiry"`) to avoid leaking stack traces or configuration details to the client.

### 6. Deployment Configuration
* **Security Headers**: High-grade HTTP headers are defined in both `next.config.mjs` and `vercel.json` (providing safety both on the Vercel CDN and in standalone Next.js server mode):
  * `X-Content-Type-Options: nosniff`
  * `X-Frame-Options: DENY` (mitigates clickjacking).
  * `Referrer-Policy: strict-origin-when-cross-origin`
  * `Strict-Transport-Security` (configured for 2 years with preloading).
  * `Content-Security-Policy`: Strong CSP blocking unauthorized connection/script endpoints, object embeds (`object-src 'none'`), and restricting image resources to Unsplash, self, and the Supabase Storage domain.
* **Image Optimization**: `next/image` is strictly bound to approved remote host patterns, preventing open redirect resource loading.
* **PostHog Proxy**: Proxies tracking scripts through the same-origin `/ingest/*` route, bypassing ad-blocker false positives while staying compliant with the defined CSP.

---

## Recommendations & Next Steps

While Mushida-Craft is in excellent condition, we suggest the following optimizations to improve future maintainability:
1. **Configure a Test Suite**: The repository currently has no testing framework configured. Configuring Vitest or Jest would allow writing unit tests for:
   * HMAC session token generation and verification.
   * File upload magic-byte verification logic.
   * API Zod parsers and rate limiting.
2. **Refine CSP script-src**: If the application does not rely on third-party scripts that require inline evaluations, consider removing `'unsafe-eval'` from the script-src policy in production to further mitigate hypothetical XSS vectors.
3. **Database Schema Migrations Check**: When introducing new features or deploying updates, ensure all schema changes are committed under `supabase/migrations/` and run via `npm run db:setup` to maintain database parity across environments.