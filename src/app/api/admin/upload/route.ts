import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { guardAdminRequest } from "@/lib/admin-guard";
import {
  MAX_IMAGE_FILE_SIZE,
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_EXTENSIONS,
  PRODUCT_IMAGES_BUCKET,
  isProductImageMimeType,
  type ProductImageMimeType,
} from "@/lib/product-images";
import { getServerSupabaseClient } from "@/lib/supabase";

export const runtime = "nodejs";
const MAX_UPLOAD_REQUEST_SIZE =
  MAX_IMAGE_FILE_SIZE * MAX_PRODUCT_IMAGES + 1024 * 1024;

function invalidUpload(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

function matchesBytes(
  bytes: Uint8Array,
  offset: number,
  signature: number[],
): boolean {
  return signature.every((value, index) => bytes[offset + index] === value);
}

function hasValidImageSignature(
  bytes: Uint8Array,
  mimeType: ProductImageMimeType,
): boolean {
  if (mimeType === "image/jpeg") {
    return matchesBytes(bytes, 0, [0xff, 0xd8, 0xff]);
  }
  if (mimeType === "image/png") {
    return matchesBytes(bytes, 0, [
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
  }
  if (mimeType === "image/webp") {
    return (
      matchesBytes(bytes, 0, [0x52, 0x49, 0x46, 0x46]) &&
      matchesBytes(bytes, 8, [0x57, 0x45, 0x42, 0x50])
    );
  }

  if (!matchesBytes(bytes, 4, [0x66, 0x74, 0x79, 0x70])) return false;
  for (let offset = 8; offset <= Math.min(bytes.length - 4, 32); offset += 4) {
    if (
      matchesBytes(bytes, offset, [0x61, 0x76, 0x69, 0x66]) ||
      matchesBytes(bytes, offset, [0x61, 0x76, 0x69, 0x73])
    ) {
      return true;
    }
  }
  return false;
}

/** POST /api/admin/upload - upload banyak gambar produk ke Supabase Storage. */
export async function POST(req: Request) {
  try {
    const denied = await guardAdminRequest(req);
    if (denied) return denied;

    const contentLength = Number(req.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_UPLOAD_REQUEST_SIZE) {
      return invalidUpload("Ukuran total upload terlalu besar.");
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return invalidUpload("Form upload tidak valid.");
    }

    const entries = formData.getAll("files");
    if (entries.length === 0) {
      return invalidUpload("Pilih minimal 1 file gambar.");
    }
    if (entries.length > MAX_PRODUCT_IMAGES) {
      return invalidUpload(
        `Maksimal ${MAX_PRODUCT_IMAGES} file gambar per upload.`,
      );
    }

    const files: Array<{
      buffer: ArrayBuffer;
      mimeType: ProductImageMimeType;
    }> = [];
    for (const [index, entry] of entries.entries()) {
      if (typeof entry === "string") {
        return invalidUpload(`File ke-${index + 1} tidak valid.`);
      }
      if (!isProductImageMimeType(entry.type)) {
        return invalidUpload(
          `File ke-${index + 1} harus berformat JPEG, PNG, WebP, atau AVIF.`,
        );
      }
      if (entry.size === 0) {
        return invalidUpload(`File ke-${index + 1} kosong.`);
      }
      if (entry.size > MAX_IMAGE_FILE_SIZE) {
        return invalidUpload(`File ke-${index + 1} melebihi batas 5 MB.`);
      }

      const data = await entry.arrayBuffer();
      if (!hasValidImageSignature(new Uint8Array(data), entry.type)) {
        return invalidUpload(
          `Isi file ke-${index + 1} tidak sesuai dengan format ${entry.type}.`,
        );
      }
      files.push({ buffer: data, mimeType: entry.type });
    }

    const bucket = getServerSupabaseClient().storage.from(PRODUCT_IMAGES_BUCKET);
    const results = await Promise.allSettled(
      files.map(async ({ buffer, mimeType }) => {
        const extension = PRODUCT_IMAGE_EXTENSIONS[mimeType];
        const path = `${randomUUID()}.${extension}`;
        const { error } = await bucket.upload(path, buffer, {
          cacheControl: "31536000",
          contentType: mimeType,
          upsert: false,
        });
        if (error) throw error;

        const { data } = bucket.getPublicUrl(path);
        return { path, url: data.publicUrl };
      }),
    );

    const failedUpload = results.find((result) => result.status === "rejected");
    if (failedUpload) {
      const uploadedPaths = results.flatMap((result) =>
        result.status === "fulfilled" ? [result.value.path] : [],
      );
      if (uploadedPaths.length > 0) {
        const { error } = await bucket.remove(uploadedPaths);
        if (error) console.error("Gagal rollback upload gambar produk:", error);
      }
      throw failedUpload.reason;
    }

    const urls = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value.url] : [],
    );
    return NextResponse.json({ ok: true, urls });
  } catch (err) {
    console.error("Gagal mengunggah gambar produk:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
