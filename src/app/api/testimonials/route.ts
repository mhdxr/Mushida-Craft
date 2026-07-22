import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { notifyNewTestimonial } from "@/lib/admin-notify";
import {
  createTestimonial,
  fetchApprovedTestimonials,
  removeTestimonialAvatarByUrl,
  uploadTestimonialAvatar,
} from "@/lib/testimonial-api";
import { consumeTestimonialSubmit } from "@/lib/rate-limit";
import { testimonialSchema } from "@/lib/validations";

export const runtime = "nodejs";

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * GET /api/testimonials — daftar testimoni approved (publik).
 * Dipakai homepage client fetch agar tidak tergantung ISR 5 menit.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitRaw = Number(searchParams.get("limit") || "60");
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 60)
      : 60;

    const testimonials = await fetchApprovedTestimonials(limit);
    return NextResponse.json(
      { ok: true, testimonials },
      {
        headers: {
          // Browser boleh cache sebentar; admin approve akan revalidatePath.
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    console.error("Gagal mengambil testimoni publik:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server.", testimonials: [] },
      { status: 500 },
    );
  }
}

/**
 * POST /api/testimonials — kirim testimoni publik (status: pending).
 * Menerima JSON atau multipart/form-data (dengan foto opsional "avatar").
 * Rate limited: 3 submit / jam / IP.
 */
export async function POST(req: Request) {
  let uploadedAvatarUrl: string | null = null;

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

    const contentType = req.headers.get("content-type") || "";
    let name = "";
    let message = "";
    let rating = 5;
    let avatarFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      let formData: FormData;
      try {
        formData = await req.formData();
      } catch {
        return NextResponse.json(
          { ok: false, message: "Data testimoni tidak valid." },
          { status: 400 },
        );
      }

      name = String(formData.get("name") ?? "");
      message = String(formData.get("message") ?? "");
      const ratingRaw = formData.get("rating");
      rating = Number(ratingRaw);

      const avatarEntry = formData.get("avatar");
      if (avatarEntry instanceof File && avatarEntry.size > 0) {
        avatarFile = avatarEntry;
      }
    } else {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { ok: false, message: "Data testimoni tidak valid." },
          { status: 400 },
        );
      }
      const raw = body as {
        name?: string;
        message?: string;
        rating?: number;
      };
      name = raw.name ?? "";
      message = raw.message ?? "";
      rating = Number(raw.rating);
    }

    const result = testimonialSchema.safeParse({ name, message, rating });
    if (!result.success) {
      const first = result.error.issues[0]?.message;
      return NextResponse.json(
        { ok: false, message: first || "Data testimoni tidak valid." },
        { status: 400 },
      );
    }

    if (avatarFile) {
      try {
        const uploaded = await uploadTestimonialAvatar(avatarFile);
        uploadedAvatarUrl = uploaded.url;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Gagal mengunggah foto.";
        return NextResponse.json({ ok: false, message: msg }, { status: 400 });
      }
    }

    const testimonial = await createTestimonial({
      name: result.data.name,
      message: result.data.message,
      rating: result.data.rating,
      avatar: uploadedAvatarUrl ?? undefined,
    });

    notifyNewTestimonial({
      id: testimonial.id,
      name: testimonial.name,
      rating: testimonial.rating,
      message: testimonial.message,
    });

    // Admin list / dashboard bisa stale di edge — soft revalidate.
    try {
      revalidatePath("/admin");
    } catch {
      // ignore di env tanpa cache
    }

    return NextResponse.json(
      {
        ok: true,
        message:
          "Terima kasih! Testimoni kamu menunggu moderasi admin sebelum tampil di homepage.",
        testimonial: { id: testimonial.id, status: "pending" },
      },
      { status: 201 },
    );
  } catch (err) {
    // Rollback avatar bila insert gagal setelah upload.
    if (uploadedAvatarUrl) {
      await removeTestimonialAvatarByUrl(uploadedAvatarUrl);
    }
    console.error("Gagal menyimpan testimoni:", err);
    return NextResponse.json(
      {
        ok: false,
        message:
          err instanceof Error && /avatar|column/i.test(err.message)
            ? "Gagal menyimpan. Pastikan migrasi testimoni (kolom avatar) sudah dijalankan di database."
            : "Terjadi kesalahan pada server.",
      },
      { status: 500 },
    );
  }
}
