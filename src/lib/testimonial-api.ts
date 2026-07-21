import { randomUUID } from "node:crypto";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/product-images";
import { getBrowserSupabaseClient, getServerSupabaseClient } from "@/lib/supabase";
import {
  AVATAR_EXTENSIONS,
  hasValidAvatarSignature,
  isAvatarMimeType,
  MAX_AVATAR_FILE_SIZE,
  TESTIMONIAL_AVATAR_FOLDER,
  type AvatarMimeType,
} from "@/lib/testimonial-avatar";
import type { Testimonial, TestimonialStatus } from "@/types";

const TABLE = "testimonials";

interface TestimonialRow {
  id: string;
  name: string;
  role: string | null;
  message: string;
  rating: number;
  status: TestimonialStatus;
  avatar: string | null;
  created_at: string;
}

function rowToTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    role: row.role ?? undefined,
    message: row.message,
    rating: row.rating,
    status: row.status,
    avatar: row.avatar ?? undefined,
    createdAt: row.created_at,
  };
}

/** Public: ambil testimoni yang sudah disetujui (terbaru dulu). */
export async function fetchApprovedTestimonials(
  limit = 60,
): Promise<Testimonial[]> {
  const client = getBrowserSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => rowToTestimonial(row as TestimonialRow));
}

/**
 * Upload avatar ke Storage (service role).
 * Path: testimonials/<uuid>.<ext> di bucket product-images.
 * Return public URL, atau null bila file kosong.
 */
export async function uploadTestimonialAvatar(
  file: File,
): Promise<{ url: string; path: string }> {
  if (!isAvatarMimeType(file.type)) {
    throw new Error("Foto harus berformat JPEG, PNG, atau WebP.");
  }
  if (file.size === 0) {
    throw new Error("File foto kosong.");
  }
  if (file.size > MAX_AVATAR_FILE_SIZE) {
    throw new Error("Foto maksimal 1 MB.");
  }

  const mimeType = file.type as AvatarMimeType;
  const buffer = await file.arrayBuffer();
  if (!hasValidAvatarSignature(new Uint8Array(buffer), mimeType)) {
    throw new Error("Isi file tidak sesuai format gambar yang diizinkan.");
  }

  const extension = AVATAR_EXTENSIONS[mimeType];
  const path = `${TESTIMONIAL_AVATAR_FOLDER}/${randomUUID()}.${extension}`;
  const bucket = getServerSupabaseClient().storage.from(PRODUCT_IMAGES_BUCKET);

  const { error } = await bucket.upload(path, buffer, {
    cacheControl: "31536000",
    contentType: mimeType,
    upsert: false,
  });
  if (error) throw error;

  const { data } = bucket.getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/** Hapus file avatar dari Storage (best-effort, jangan gagalkan alur utama). */
export async function removeTestimonialAvatarByUrl(
  avatarUrl: string | undefined | null,
): Promise<void> {
  if (!avatarUrl) return;
  try {
    const marker = `/object/public/${PRODUCT_IMAGES_BUCKET}/`;
    const idx = avatarUrl.indexOf(marker);
    if (idx === -1) return;
    const path = avatarUrl.slice(idx + marker.length);
    if (!path.startsWith(`${TESTIMONIAL_AVATAR_FOLDER}/`)) return;

    const { error } = await getServerSupabaseClient()
      .storage.from(PRODUCT_IMAGES_BUCKET)
      .remove([path]);
    if (error) console.error("Gagal menghapus avatar testimoni:", error);
  } catch (err) {
    console.error("Gagal menghapus avatar testimoni:", err);
  }
}

/** Public submit (service role): simpan sebagai pending. */
export async function createTestimonial(input: {
  name: string;
  message: string;
  rating: number;
  avatar?: string;
}): Promise<Testimonial> {
  const client = getServerSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .insert({
      name: input.name.trim(),
      role: null,
      message: input.message.trim(),
      rating: input.rating,
      status: "pending",
      avatar: input.avatar?.trim() || null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToTestimonial(data as TestimonialRow);
}

/** Admin: daftar semua testimoni (pending dulu, lalu terbaru). */
export async function listAllTestimonials(): Promise<Testimonial[]> {
  const client = getServerSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = (data ?? []).map((row) =>
    rowToTestimonial(row as TestimonialRow),
  );
  // Pending di atas, lalu approved (keduanya tetap urut created_at desc di dalam grup).
  return rows.sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === "pending" ? -1 : 1;
  });
}

/** Admin: setujui testimoni. */
export async function approveTestimonial(
  id: string,
): Promise<Testimonial | null> {
  const client = getServerSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .update({ status: "approved" })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data ? rowToTestimonial(data as TestimonialRow) : null;
}

/** Admin: hapus testimoni (+ bersihkan avatar di Storage). */
export async function deleteTestimonial(id: string): Promise<void> {
  const client = getServerSupabaseClient();

  // Ambil avatar dulu agar bisa dihapus dari Storage.
  const { data: existing } = await client
    .from(TABLE)
    .select("avatar")
    .eq("id", id)
    .maybeSingle();

  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;

  if (existing && typeof existing === "object" && "avatar" in existing) {
    await removeTestimonialAvatarByUrl(
      (existing as { avatar: string | null }).avatar,
    );
  }
}
