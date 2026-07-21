/**
 * Normalisasi URL gambar untuk SEO (Open Graph, JSON-LD, sitemap).
 * - Absolute https → pakai apa adanya
 * - Path relatif (/foo.jpg) → prefix site URL
 * - Supabase Storage path / full URL → pastikan absolute
 */

import { getSiteUrl } from "@/lib/site";

export function toAbsoluteImageUrl(
  src: string | null | undefined,
): string | null {
  if (!src?.trim()) return null;
  const value = src.trim();

  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;

  // Relatif ke origin situs (public/)
  if (value.startsWith("/")) return `${getSiteUrl()}${value}`;

  // Path tanpa slash — anggap relative site
  return `${getSiteUrl()}/${value.replace(/^\.\//, "")}`;
}

/** Ambil N URL absolut pertama (lewati yang kosong). */
export function toAbsoluteImageUrls(
  images: string[] | null | undefined,
  limit = 5,
): string[] {
  if (!images?.length) return [];
  const out: string[] = [];
  for (const img of images) {
    const abs = toAbsoluteImageUrl(img);
    if (abs) out.push(abs);
    if (out.length >= limit) break;
  }
  return out;
}
