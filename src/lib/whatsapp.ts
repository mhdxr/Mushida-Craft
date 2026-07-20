import type { CustomOrderForm, Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

const DEFAULT_NUMBER = "6281234567890";

export function getWhatsAppNumber(): string {
  // wa.me hanya menerima digit (format internasional tanpa "+").
  // Sanitasi env agar spasi/"+"/karakter asing tidak merusak link.
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_NUMBER;
  const digits = raw.replace(/\D/g, "");
  return digits || DEFAULT_NUMBER;
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
  return "Halo, Mushida! 🌸";
}

/** Pesan inquiry umum (FAB, footer). */
export function buildDefaultInquiryMessage(): string {
  return `${buildGreetingOpener()} Saya ingin tanya-tanya tentang bouquet bunga.`;
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
