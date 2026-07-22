import { NextResponse } from "next/server";
import { z } from "zod";
import { notifyNewInquiry } from "@/lib/admin-notify";
import { createInquiry, type InquirySource } from "@/lib/inquiry-api";
import { consumeInquiryLog } from "@/lib/rate-limit";

export const runtime = "nodejs";

const SOURCES = [
  "pdp_inline",
  "pdp_sticky",
  "custom_order",
  "fab",
  "footer",
  "delivery_note",
  "other",
] as const;

const inquiryMetaValueSchema = z.union([
  z.string().max(200),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

const inquiryBodySchema = z.object({
  source: z.enum(SOURCES),
  productId: z.string().max(80).optional(),
  productSlug: z.string().max(120).optional(),
  productName: z.string().max(120).optional(),
  productPrice: z.number().int().nonnegative().optional(),
  customerName: z.string().max(80).optional(),
  customerWa: z.string().max(30).optional(),
  notes: z.string().max(500).optional(),
  // Batasi bentuk meta: primitif saja, max 12 key — cegah JSONB spam.
  meta: z
    .record(z.string().max(40), inquiryMetaValueSchema)
    .refine((obj) => Object.keys(obj).length <= 12, {
      message: "Meta terlalu banyak field.",
    })
    .optional(),
});

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * POST /api/inquiries — catat lead WA (fire-and-forget dari client).
 * Tidak memblokir buka WhatsApp bila gagal di client.
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "Data tidak valid." },
        { status: 400 },
      );
    }

    const parsed = inquiryBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Data inquiry tidak valid." },
        { status: 400 },
      );
    }

    // Rate limit setelah validasi — body invalid tidak menghabiskan kuota.
    const { allowed } = await consumeInquiryLog(ip);
    if (!allowed) {
      return NextResponse.json(
        { ok: false, message: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429 },
      );
    }

    const inquiry = await createInquiry({
      source: parsed.data.source as InquirySource,
      productId: parsed.data.productId,
      productSlug: parsed.data.productSlug,
      productName: parsed.data.productName,
      productPrice: parsed.data.productPrice,
      customerName: parsed.data.customerName,
      customerWa: parsed.data.customerWa,
      notes: parsed.data.notes,
      meta: {
        ...(parsed.data.meta ?? {}),
        ip,
        userAgent: req.headers.get("user-agent")?.slice(0, 200) ?? undefined,
      },
    });

    // Email admin opsional (no-op tanpa RESEND_API_KEY) — fire-and-forget.
    notifyNewInquiry({
      id: inquiry.id,
      source: inquiry.source,
      productName: inquiry.productName,
      customerName: inquiry.customerName,
      customerWa: inquiry.customerWa,
      notes: inquiry.notes,
    });

    return NextResponse.json(
      { ok: true, id: inquiry.id },
      { status: 201 },
    );
  } catch (err) {
    console.error("Gagal menyimpan inquiry:", err);
    // Jangan bocorkan detail; client boleh ignore error.
    return NextResponse.json(
      { ok: false, message: "Gagal menyimpan inquiry." },
      { status: 500 },
    );
  }
}
