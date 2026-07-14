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
