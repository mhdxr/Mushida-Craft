/** Batasan & helper upload avatar testimoni. */

export const TESTIMONIAL_AVATAR_FOLDER = "testimonials";
/** Avatar lebih kecil dari gambar produk — hemat storage & bandwidth. */
export const MAX_AVATAR_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

export const AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AvatarMimeType = (typeof AVATAR_MIME_TYPES)[number];

export const AVATAR_EXTENSIONS: Record<AvatarMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isAvatarMimeType(mimeType: string): mimeType is AvatarMimeType {
  return AVATAR_MIME_TYPES.some((allowed) => allowed === mimeType);
}

function matchesBytes(
  bytes: Uint8Array,
  offset: number,
  signature: number[],
): boolean {
  return signature.every((value, index) => bytes[offset + index] === value);
}

/** Cek magic bytes agar file yang di-rename tidak lolos. */
export function hasValidAvatarSignature(
  bytes: Uint8Array,
  mimeType: AvatarMimeType,
): boolean {
  if (mimeType === "image/jpeg") {
    return matchesBytes(bytes, 0, [0xff, 0xd8, 0xff]);
  }
  if (mimeType === "image/png") {
    return matchesBytes(bytes, 0, [
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
  }
  // WebP: RIFF....WEBP
  return (
    matchesBytes(bytes, 0, [0x52, 0x49, 0x46, 0x46]) &&
    matchesBytes(bytes, 8, [0x57, 0x45, 0x42, 0x50])
  );
}
