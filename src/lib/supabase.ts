import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client factory.
 *
 * Dua jenis client:
 * - Browser client: pakai anon key (public, RLS enforced — hanya bisa SELECT)
 * - Server client: pakai service role key (server-only, bypass RLS — untuk CRUD admin)
 *
 * Login admin TIDAK pakai Supabase Auth; tetap memakai env credentials
 * dengan cookie sesi custom (lihat src/lib/auth.ts).
 */

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Environment variable ${key} belum diset. Lihat .env.example untuk panduan konfigurasi Supabase.`,
    );
  }
  return value;
}

/**
 * Browser-side Supabase client (anon key).
 * Dipakai untuk public reads (katalog, detail produk).
 * RLS membatasi hanya ke SELECT.
 *
 * Dibuat lazy & di-cache per request browser.
 */
let browserClient: SupabaseClient | null = null;

export function getBrowserSupabaseClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY wajib diset. Lihat .env.example.",
    );
  }

  browserClient = createClient(url, anonKey);
  return browserClient;
}

/**
 * Server-side Supabase client (service role key).
 * Dipakai HANYA di server (API routes, server components) untuk operasi
 * yang butuh bypass RLS (INSERT/UPDATE/DELETE oleh admin).
 *
 * JANGAN expose service role key ke browser.
 */
let serverClient: SupabaseClient | null = null;

export function getServerSupabaseClient(): SupabaseClient {
  if (serverClient) return serverClient;

  const url = getEnvOrThrow("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY");

  serverClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serverClient;
}
