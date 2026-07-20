import type { CustomOrderForm, Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

// Nomor bisnis Mushida Craft — fallback bila env tidak di-set.
const DEFAULT_NUMBER = "6285713254800";

/**
 * Normalisasi ke digit internasional untuk wa.me (tanpa "+").
 * - 08xxxxxxxxxx → 628xxxxxxxxxx (lokal ID)
 * - 8xxxxxxxxxx → 628xxxxxxxxxx
 * - 62… / lain → digit apa adanya
 */
function normalizeWhatsAppDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  // Lokal Indonesia: 08… atau 8… → 628…
  if (digits.startsWith("0") && digits.length >= 10) {
    digits = `62${digits.slice(1)}`;
  } else if (
    digits.startsWith("8") &&
    !digits.startsWith("62") &&
    digits.length >= 9 &&
    digits.length <= 13
  ) {
    digits = `62${digits}`;
  }

  return digits;
}

export function getWhatsAppNumber(): string {
  // wa.me hanya menerima digit (format internasional tanpa "+").
  // Sanitasi env agar spasi/"+"/karakter asing / format lokal 08… tidak merusak link.
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_NUMBER;
  const digits = normalizeWhatsAppDigits(raw);
  return digits || DEFAULT_NUMBER;
}

/**
 * Format nomor WA untuk tampilan UI (bukan link).
 * 6285xxxxxxxx → 085x-xxxx-xxxx (lokal ID)
 */
export function formatWhatsAppDisplay(digits?: string): string {
  const international = normalizeWhatsAppDigits(
    digits ?? getWhatsAppNumber(),
  );
  if (!international) return "WhatsApp";

  // Indonesia: 62… → 0… untuk label
  if (international.startsWith("62") && international.length >= 10) {
    const local = `0${international.slice(2)}`;
    if (local.length === 11) {
      return `${local.slice(0, 4)}-${local.slice(4, 7)}-${local.slice(7)}`;
    }
    if (local.length === 12 || local.length === 13) {
      return `${local.slice(0, 4)}-${local.slice(4, 8)}-${local.slice(8)}`;
    }
    return local.replace(/(\d{4})(?=\d)/g, "$1-").replace(/-$/, "");
  }

  return `+${international}`;
}

export function buildWhatsAppUrl(message: string): string {
  const number = getWhatsAppNumber();
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

/**
 * Pembuka pesan WhatsApp.
 * Sapaan waktu TIDAK dihitung di sini (hindari mismatch SSR/client
 * & dependency greeting di path kritis layout/footer).
 */
function buildGreetingOpener(): string {
  return "Halo, Mushida Craft! 🌸";
}

/** Pesan inquiry umum (FAB, footer). */
export function buildDefaultInquiryMessage(): string {
  return `${buildGreetingOpener()} Saya ingin tanya-tanya tentang rangkaian bouquet.`;
}

export function buildProductOrderMessage(product: Product): string {
  return [
    buildGreetingOpener(),
    "",
    "Saya tertarik dengan produk berikut:",
    `• Nama: ${product.name}`,
    `• Harga: ${formatCurrency(product.price)}`,
    `• Kategori: ${product.category}`,
    "",
    "Boleh info lebih lanjut untuk pemesanannya? Terima kasih.",
  ].join("\n");
}

export function buildCustomOrderMessage(form: CustomOrderForm): string {
  return [
    buildGreetingOpener(),
    "Saya ingin request *Custom Bouquet* dengan detail berikut:",
    "",
    `• Nama: ${form.name}`,
    `• WhatsApp: ${form.whatsapp}`,
    `• Jenis bouquet: ${form.bouquetType}`,
    `• Budget: ${form.budget}`,
    `• Tanggal dibutuhkan: ${form.neededDate}`,
    form.notes ? `• Catatan: ${form.notes}` : "",
    "",
    "Mohon dibantu ya, terima kasih banyak!",
  ]
    .filter(Boolean)
    .join("\n");
}
