import { NextResponse } from "next/server";
import { guardAdminRequest } from "@/lib/admin-guard";
import {
  updateInquiryStatus,
  type InquiryStatus,
} from "@/lib/inquiry-api";
import { z } from "zod";

const bodySchema = z.object({
  status: z.enum(["new", "contacted", "archived"]),
});

/**
 * PATCH /api/admin/inquiries/[id] — update status lead (admin only).
 * Body: { status: "new" | "contacted" | "archived" }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await guardAdminRequest(req);
    if (denied) return denied;

    const { id } = await params;
    if (!id?.trim()) {
      return NextResponse.json(
        { ok: false, message: "ID inquiry tidak valid." },
        { status: 400 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "Body tidak valid." },
        { status: 400 },
      );
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message:
            parsed.error.issues[0]?.message ||
            "Status harus new, contacted, atau archived.",
        },
        { status: 400 },
      );
    }

    const inquiry = await updateInquiryStatus(
      id,
      parsed.data.status as InquiryStatus,
    );
    if (!inquiry) {
      return NextResponse.json(
        { ok: false, message: "Inquiry tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, inquiry });
  } catch (err) {
    console.error("Gagal update inquiry:", err);
    return NextResponse.json(
      {
        ok: false,
        message:
          err instanceof Error && /column|status|relation/i.test(err.message)
            ? "Kolom status belum ada. Jalankan migrasi 0007_inquiry_status.sql."
            : "Terjadi kesalahan pada server.",
      },
      { status: 500 },
    );
  }
}
