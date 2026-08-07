export const PRODUCT_IMAGES_BUCKET = "product-images";
export const MAX_PRODUCT_IMAGES = 10;
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

export const PRODUCT_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type ProductImageMimeType = (typeof PRODUCT_IMAGE_MIME_TYPES)[number];

export const PRODUCT_IMAGE_EXTENSIONS: Record<ProductImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export function isProductImageMimeType(
  mimeType: string,
): mimeType is ProductImageMimeType {
  return PRODUCT_IMAGE_MIME_TYPES.some((allowed) => allowed === mimeType);
}

function matchesBytes(
  bytes: Uint8Array,
  offset: number,
  signature: number[],
): boolean {
  return signature.every((value, index) => bytes[offset + index] === value);
}

/**
 * Cek magic bytes file gambar produk (JPEG/PNG/WebP/AVIF).
 * Mencegah file non-gambar (HTML, SVG, executable) yang di-rename lolos upload.
 */
export function hasValidImageSignature(
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

  // AVIF: ISO BMFF container dengan brand "avif" / "avis" di major/compatible brands.
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
