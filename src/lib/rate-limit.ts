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

function hasUpstashEnv(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
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
  if (warnedAboutFallback) return;
  warnedAboutFallback = true;
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
