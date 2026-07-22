/**
 * Notifikasi admin opsional (email via Resend REST API).
 * - No-op bila RESEND_API_KEY / ADMIN_NOTIFY_EMAIL kosong
 * - Fire-and-forget: jangan block response utama
 * - Tanpa dependency baru (fetch ke api.resend.com)
 */

import { getSiteUrl } from "@/lib/site";

function notifyEmail(): string {
  return (
    process.env.ADMIN_NOTIFY_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    ""
  );
}

function resendKey(): string {
  return process.env.RESEND_API_KEY?.trim() || "";
}

function fromAddress(): string {
  // Domain default Resend untuk dev; ganti RESEND_FROM ke domain verified di prod.
  return (
    process.env.RESEND_FROM?.trim() || "Mushida Craft <onboarding@resend.dev>"
  );
}

export function isAdminNotifyConfigured(): boolean {
  return Boolean(resendKey() && notifyEmail());
}

async function sendEmail(input: {
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const key = resendKey();
  const to = notifyEmail();
  if (!key || !to) return;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [to],
        subject: input.subject,
        text: input.text,
        html: input.html ?? undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        "Admin notify email gagal:",
        res.status,
        body.slice(0, 300),
      );
    }
  } catch (err) {
    console.error("Admin notify email error:", err);
  }
}

/** Fire-and-forget wrapper — never throws to caller. */
export function notifyAdminAsync(task: () => Promise<void>): void {
  void task().catch((err) => {
    console.error("Admin notify task error:", err);
  });
}

export function notifyNewInquiry(input: {
  id: string;
  source: string;
  productName?: string;
  customerName?: string;
  customerWa?: string;
  notes?: string;
}): void {
  if (!isAdminNotifyConfigured()) return;

  notifyAdminAsync(async () => {
    const site = getSiteUrl();
    const lines = [
      "Inquiry WhatsApp baru di Mushida Craft.",
      "",
      `Sumber: ${input.source}`,
      input.productName ? `Produk: ${input.productName}` : null,
      input.customerName ? `Nama: ${input.customerName}` : null,
      input.customerWa ? `WA: ${input.customerWa}` : null,
      input.notes ? `Catatan: ${input.notes}` : null,
      "",
      `Buka admin: ${site}/admin/inquiries`,
      `ID: ${input.id}`,
    ].filter(Boolean);

    await sendEmail({
      subject: input.productName
        ? `[Mushida] Inquiry: ${input.productName}`
        : "[Mushida] Inquiry WhatsApp baru",
      text: lines.join("\n"),
      html: `
        <p><strong>Inquiry WhatsApp baru</strong></p>
        <ul>
          <li>Sumber: ${escapeHtml(input.source)}</li>
          ${input.productName ? `<li>Produk: ${escapeHtml(input.productName)}</li>` : ""}
          ${input.customerName ? `<li>Nama: ${escapeHtml(input.customerName)}</li>` : ""}
          ${input.customerWa ? `<li>WA: ${escapeHtml(input.customerWa)}</li>` : ""}
          ${input.notes ? `<li>Catatan: ${escapeHtml(input.notes)}</li>` : ""}
        </ul>
        <p><a href="${site}/admin/inquiries">Buka Inquiry WA di admin</a></p>
      `.trim(),
    });
  });
}

export function notifyNewTestimonial(input: {
  id: string;
  name: string;
  rating: number;
  message: string;
}): void {
  if (!isAdminNotifyConfigured()) return;

  notifyAdminAsync(async () => {
    const site = getSiteUrl();
    const preview =
      input.message.length > 200
        ? `${input.message.slice(0, 200)}…`
        : input.message;

    await sendEmail({
      subject: `[Mushida] Testimoni baru dari ${input.name}`,
      text: [
        "Testimoni baru menunggu moderasi.",
        "",
        `Nama: ${input.name}`,
        `Rating: ${input.rating}/5`,
        `Pesan: ${preview}`,
        "",
        `Buka admin: ${site}/admin/testimoni`,
        `ID: ${input.id}`,
      ].join("\n"),
      html: `
        <p><strong>Testimoni baru menunggu moderasi</strong></p>
        <ul>
          <li>Nama: ${escapeHtml(input.name)}</li>
          <li>Rating: ${input.rating}/5</li>
          <li>Pesan: ${escapeHtml(preview)}</li>
        </ul>
        <p><a href="${site}/admin/testimoni">Buka moderasi testimoni</a></p>
      `.trim(),
    });
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
