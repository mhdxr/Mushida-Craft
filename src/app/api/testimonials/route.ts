import { NextResponse } from "next/server";
import { createTestimonial } from "@/lib/testimonial-api";
import { consumeTestimonialSubmit } from "@/lib/rate-limit";
import { testimonialSchema } from "@/lib/validations";

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * POST /api/testimonials — kirim testimoni publik (status: pending).
 * Rate limited: 3 submit / jam / IP.
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { allowed } = await consumeTestimonialSubmit(ip);
    if (!allowed) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Terlalu banyak testimoni dari perangkat ini. Coba lagi nanti.",
        },
        { status: 429 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "Data testimoni tidak valid." },
        { status: 400 },
      );
    }

    const result = testimonialSchema.safeParse(body);
    if (!result.success) {
      const first = result.error.issues[0]?.message;
      return NextResponse.json(
        { ok: false, message: first || "Data testimoni tidak valid." },
        { status: 400 },
      );
    }

    const role = result.data.role?.trim() || undefined;
    const testimonial = await createTestimonial({
      name: result.data.name,
      role,
      message: result.data.message,
      rating: result.data.rating,
    });

    return NextResponse.json(
      {
        ok: true,
        message:
          "Terima kasih! Testimoni Anda menunggu moderasi sebelum ditampilkan.",
        testimonial: { id: testimonial.id },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Gagal menyimpan testimoni:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
