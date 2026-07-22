import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { guardAdminRequest } from "@/lib/admin-guard";
import {
  approveTestimonial,
  deleteTestimonial,
} from "@/lib/testimonial-api";

function revalidatePublicTestimonials() {
  try {
    // Homepage SSR first paint + admin shell
    revalidatePath("/");
    revalidatePath("/admin");
  } catch {
    // ignore
  }
}

/**
 * PATCH /api/admin/testimonials/[id] — setujui testimoni (admin only).
 * Body opsional: { action: "approve" } (default).
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await guardAdminRequest(req);
    if (denied) return denied;

    const { id } = await params;
    let action = "approve";
    try {
      const body = (await req.json()) as { action?: string };
      if (body?.action) action = body.action;
    } catch {
      // Body kosong = approve.
    }

    if (action !== "approve") {
      return NextResponse.json(
        { ok: false, message: "Aksi tidak dikenali." },
        { status: 400 },
      );
    }

    const testimonial = await approveTestimonial(id);
    if (!testimonial) {
      return NextResponse.json(
        { ok: false, message: "Testimoni tidak ditemukan." },
        { status: 404 },
      );
    }

    revalidatePublicTestimonials();

    return NextResponse.json({ ok: true, testimonial });
  } catch (err) {
    console.error("Gagal menyetujui testimoni:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/testimonials/[id] — hapus testimoni (admin only).
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await guardAdminRequest(req);
    if (denied) return denied;

    const { id } = await params;
    await deleteTestimonial(id);
    revalidatePublicTestimonials();
    return NextResponse.json({ ok: true, message: "Testimoni dihapus." });
  } catch (err) {
    console.error("Gagal menghapus testimoni:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
