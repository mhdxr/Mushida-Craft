/**
 * Rate limiter login admin.
 *
 * Prefer Upstash Redis (persisten lintas instance serverless).
 * Fallback ke Map in-memory jika env Upstash belum diset (dev lokal).
 *
 * Window: 15 menit, ambang: 5 percobaan gagal per IP.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const MAX_FAILED_ATTEMPTS = 5;
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

interface LoginAttempts {
  count: number;
  expiresAt: number;
}

// Fallback in-memory (per-proses). Tidak konsisten di multi-instance.
const failedLoginAttempts = new Map<string, LoginAttempts>();
let warnedAboutFallback = false;
let redisRatelimit: Ratelimit | null = null;

/** True jika env Upstash REST lengkap. */
export function hasUpstashEnv(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

/** Runtime production (Vercel set VERCEL=1). */
export function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1"
  );
}

/**
 * Di production multi-instance, in-memory rate limit tidak aman.
 * Kembalikan true jika Upstash wajib tapi belum dikonfigurasi.
 */
export function isRateLimitDegraded(): boolean {
  return isProductionRuntime() && !hasUpstashEnv();
}

let warnedProductionMissingUpstash = false;

function warnProductionMissingUpstashOnce() {
  if (!isRateLimitDegraded() || warnedProductionMissingUpstash) return;
  warnedProductionMissingUpstash = true;
  console.error(
    "[rate-limit] PRODUCTION tanpa UPSTASH_REDIS_REST_URL/TOKEN — " +
      "rate limit memakai Map in-memory (tidak konsisten antar instance Vercel). " +
      "Set Upstash segera. Lihat GET /api/health.",
  );
}

function getRedisRatelimit(): Ratelimit | null {
  if (!hasUpstashEnv()) return null;
  if (redisRatelimit) return redisRatelimit;

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  // Sliding window: 5 request per 15 menit per identifier (IP).
  redisRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_FAILED_ATTEMPTS, "15 m"),
    prefix: "login:fail",
    analytics: false,
  });
  return redisRatelimit;
}

function warnFallbackOnce() {
  warnProductionMissingUpstashOnce();
  if (warnedAboutFallback) return;
  warnedAboutFallback = true;
  if (isProductionRuntime()) return; // sudah error di atas
  console.warn(
    "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN belum diset — " +
      "rate limit login memakai Map in-memory (tidak terdistribusi). " +
      "Set env Upstash di production agar pembatasan konsisten lintas instance.",
  );
}

/** Cek apakah IP sudah melewati ambang percobaan gagal. */
export async function isLoginRateLimited(ip: string): Promise<boolean> {
  const limiter = getRedisRatelimit();
  if (limiter) {
    const { remaining } = await limiter.getRemaining(ip);
    return remaining <= 0;
  }

  warnFallbackOnce();
  const attempts = failedLoginAttempts.get(ip);
  if (!attempts) return false;
  if (attempts.expiresAt <= Date.now()) {
    failedLoginAttempts.delete(ip);
    return false;
  }
  return attempts.count >= MAX_FAILED_ATTEMPTS;
}

/** Catat satu percobaan login gagal untuk IP. */
export async function recordLoginFailure(ip: string): Promise<void> {
  const limiter = getRedisRatelimit();
  if (limiter) {
    await limiter.limit(ip);
    return;
  }

  warnFallbackOnce();
  const now = Date.now();
  const attempts = failedLoginAttempts.get(ip);
  if (!attempts || attempts.expiresAt <= now) {
    failedLoginAttempts.set(ip, {
      count: 1,
      expiresAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }
  attempts.count += 1;
}

/**
 * Reset counter gagal saat login sukses — HANYA untuk IP ini.
 *
 * Upstash Ratelimit@2.x: resetUsedTokens(identifier) menghapus token
 * terpakai untuk identifier tersebut (bukan global). Prefix "login:fail"
 * + identifier IP = counter per-IP terisolasi.
 *
 * @see node_modules/@upstash/ratelimit resetUsedTokens(identifier: string)
 */
export async function clearLoginFailures(ip: string): Promise<void> {
  const limiter = getRedisRatelimit();
  if (limiter) {
    // Per-identifier reset (IP yang sukses login saja).
    await limiter.resetUsedTokens(ip);
    return;
  }

  failedLoginAttempts.delete(ip);
}

// ---------------------------------------------------------------------------
// Testimonial submit rate limit — 3 submit / jam / IP
// ---------------------------------------------------------------------------

export const TESTIMONIAL_MAX_PER_HOUR = 3;
export const TESTIMONIAL_WINDOW_MS = 60 * 60 * 1000;

interface TestimonialAttempts {
  count: number;
  expiresAt: number;
}

const testimonialAttempts = new Map<string, TestimonialAttempts>();
let testimonialRedisRatelimit: Ratelimit | null = null;
let warnedAboutTestimonialFallback = false;

function getTestimonialRedisRatelimit(): Ratelimit | null {
  if (!hasUpstashEnv()) return null;
  if (testimonialRedisRatelimit) return testimonialRedisRatelimit;

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  testimonialRedisRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(TESTIMONIAL_MAX_PER_HOUR, "1 h"),
    prefix: "testimonial:submit",
    analytics: false,
  });
  return testimonialRedisRatelimit;
}

function warnTestimonialFallbackOnce() {
  warnProductionMissingUpstashOnce();
  if (warnedAboutTestimonialFallback) return;
  warnedAboutTestimonialFallback = true;
  if (isProductionRuntime()) return;
  console.warn(
    "[rate-limit] Upstash belum diset — rate limit testimoni memakai Map in-memory.",
  );
}

/**
 * Catat satu submit testimoni. Mengembalikan true jika masih diizinkan,
 * false jika IP sudah melebihi ambang (3 / jam).
 */
export async function consumeTestimonialSubmit(
  ip: string,
): Promise<{ allowed: boolean }> {
  const limiter = getTestimonialRedisRatelimit();
  if (limiter) {
    const result = await limiter.limit(ip);
    return { allowed: result.success };
  }

  warnTestimonialFallbackOnce();
  const now = Date.now();
  const attempts = testimonialAttempts.get(ip);
  if (!attempts || attempts.expiresAt <= now) {
    testimonialAttempts.set(ip, {
      count: 1,
      expiresAt: now + TESTIMONIAL_WINDOW_MS,
    });
    return { allowed: true };
  }
  if (attempts.count >= TESTIMONIAL_MAX_PER_HOUR) {
    return { allowed: false };
  }
  attempts.count += 1;
  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Inquiry log rate limit — 30 / jam / IP (klik WA sering, tapi cegah spam)
// ---------------------------------------------------------------------------

export const INQUIRY_MAX_PER_HOUR = 30;
export const INQUIRY_WINDOW_MS = 60 * 60 * 1000;

interface InquiryAttempts {
  count: number;
  expiresAt: number;
}

const inquiryAttempts = new Map<string, InquiryAttempts>();
let inquiryRedisRatelimit: Ratelimit | null = null;
let warnedAboutInquiryFallback = false;

function getInquiryRedisRatelimit(): Ratelimit | null {
  if (!hasUpstashEnv()) return null;
  if (inquiryRedisRatelimit) return inquiryRedisRatelimit;

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  inquiryRedisRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(INQUIRY_MAX_PER_HOUR, "1 h"),
    prefix: "inquiry:log",
    analytics: false,
  });
  return inquiryRedisRatelimit;
}

function warnInquiryFallbackOnce() {
  warnProductionMissingUpstashOnce();
  if (warnedAboutInquiryFallback) return;
  warnedAboutInquiryFallback = true;
  if (isProductionRuntime()) return;
  console.warn(
    "[rate-limit] Upstash belum diset — rate limit inquiry memakai Map in-memory.",
  );
}

export async function consumeInquiryLog(
  ip: string,
): Promise<{ allowed: boolean }> {
  const limiter = getInquiryRedisRatelimit();
  if (limiter) {
    const result = await limiter.limit(ip);
    return { allowed: result.success };
  }

  warnInquiryFallbackOnce();
  const now = Date.now();
  const attempts = inquiryAttempts.get(ip);
  if (!attempts || attempts.expiresAt <= now) {
    inquiryAttempts.set(ip, {
      count: 1,
      expiresAt: now + INQUIRY_WINDOW_MS,
    });
    return { allowed: true };
  }
  if (attempts.count >= INQUIRY_MAX_PER_HOUR) {
    return { allowed: false };
  }
  attempts.count += 1;
  return { allowed: true };
}
