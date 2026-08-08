/**
 * Client helper: kirim order ke API backend (mushida-craft-api),
 * lalu buka link WhatsApp yang dikembalikan server.
 *
 * Pola fallback (konsisten dengan log-inquiry):
 * - Kalau NEXT_PUBLIC_API_URL tidak di-set → bangun link WA lokal.
 * - Kalau API gagal / timeout / non-201 → fallback ke link lokal.
 * Order path TIDAK PERNAH gagal — API hanya memperkaya data.
 */

import type { CustomOrderForm, Product } from "@/types";
import {
  buildCustomOrderMessage,
  buildProductOrderMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";
import { categoryMap } from "@/data/categories";

const API_TIMEOUT_MS = 4000;

/** URL API backend — dari env, boleh kosong. */
function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return "";
  return raw.replace(/\/$/, "");
}

/**
 * Endpoint order yang dipakai client.
 * - NEXT_PUBLIC_API_URL di-set → proxy same-origin /api/orders-proxy
 *   (rewrite di next.config.mjs; tanpa CORS).
 * - Tidak di-set → fallback langsung ke base URL API (kalau ada).
 */
function getOrdersEndpoint(): string {
  const apiBase = getApiBaseUrl();
  if (!apiBase) return "";
  return "/api/orders-proxy";
}

/** Kategori slug → label UI (sama seperti whatsapp.ts frontend). */
function getCategoryLabel(category?: string): string | undefined {
  if (!category) return undefined;
  return categoryMap[category as keyof typeof categoryMap]?.name ?? category;
}

/** Pesan order produk — dipakai untuk fallback lokal & data ke API. */
export function buildProductOrderPayload(product: Product) {
  return {
    source: "product" as const,
    customerName: "", // diisi dari modal order
    customerWa: "",
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
    productPrice: product.price,
    category: getCategoryLabel(product.category),
    quantity: 1,
  };
}

/** Link WA lokal (fallback) untuk order produk. */
export function buildLocalProductOrderUrl(product: Product): string {
  return buildWhatsAppUrl(buildProductOrderMessage(product));
}

/** Link WA lokal (fallback) untuk custom order. */
export function buildLocalCustomOrderUrl(payload: {
  customerName?: string;
  customerWa?: string;
  bouquetType?: string;
  occasion?: string;
  budget?: string;
  neededDate?: string;
  deliveryArea?: string;
  notes?: string;
}): string {
  return buildWhatsAppUrl(
    buildCustomOrderMessage({
      name: payload.customerName ?? "—",
      whatsapp: payload.customerWa ?? "—",
      bouquetType: payload.bouquetType ?? "-",
      budget: payload.budget ?? "-",
      neededDate: payload.neededDate ?? "-",
      occasion: payload.occasion ?? "-",
      deliveryArea: payload.deliveryArea ?? "-",
      notes: payload.notes,
    }),
  );
}

/** Custom order — form tidak punya productId/slug. */
export function buildCustomOrderPayload(form: CustomOrderForm) {
  return {
    source: "custom" as const,
    customerName: form.name,
    customerWa: form.whatsapp,
    bouquetType: form.bouquetType,
    occasion: form.occasion,
    budget: form.budget,
    neededDate: form.neededDate,
    deliveryArea: form.deliveryArea,
    notes: form.notes,
  };
}

/**
 * Kirim order ke API backend. Return { ok, waLink }.
 * waLink selalu terisi — dari API atau fallback lokal.
 */
export async function placeOrder(
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; waLink: string }> {
  const fallback = payload.source === "custom"
    ? buildLocalCustomOrderUrl(payload)
    : buildLocalProductOrderUrl(payload as unknown as Product);

  const apiBase = getApiBaseUrl();
  if (!apiBase) return { ok: false, waLink: fallback };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(getOrdersEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) return { ok: false, waLink: fallback };

    const json = (await res.json()) as {
      ok?: boolean;
      data?: { waLink?: string };
    };
    const waLink = json.data?.waLink;
    if (!waLink) return { ok: false, waLink: fallback };

    return { ok: true, waLink };
  } catch {
    // Network error / timeout / parse error → fallback lokal.
    return { ok: false, waLink: fallback };
  } finally {
    clearTimeout(timer);
  }
}
