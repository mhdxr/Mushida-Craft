import { z } from "zod";
import {
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/product-images";

export const customOrderSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(60, "Nama maksimal 60 karakter"),
  whatsapp: z
    .string()
    .min(8, "Nomor WhatsApp tidak valid")
    .max(20, "Nomor WhatsApp tidak valid")
    .regex(/^[0-9+\-\s]+$/, "Nomor WhatsApp hanya boleh berisi angka"),
  bouquetType: z.string().min(2, "Pilih jenis bouquet").max(80),
  budget: z.string().min(2, "Masukkan kisaran budget").max(60),
  neededDate: z.string().min(1, "Tanggal wajib diisi"),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export type CustomOrderSchema = z.infer<typeof customOrderSchema>;

export const loginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(12, "Password minimal 12 karakter"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

const productBaseSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter").max(80),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(800, "Deskripsi maksimal 800 karakter"),
  price: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "Harga wajib diisi" : "Harga harus berupa angka",
    })
    .min(1000, "Harga minimal Rp1.000"),
  category: z.enum([
    "snack-bouquet",
    "money-bouquet",
    "artificial-bouquet",
    "graduation-bouquet",
    "satin-flower",
  ]),
  isAvailable: z.boolean(),
});

const productBadgeSchema = z.enum(["best-seller", "new", "sold-out"]);
const supabaseStorageUrl = (() => {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
})();
const supabaseStorageHost = supabaseStorageUrl?.hostname ?? null;

export const ALLOWED_PRODUCT_IMAGE_HOSTS = [
  "images.unsplash.com",
  "plus.unsplash.com",
  ...(supabaseStorageHost ? [supabaseStorageHost] : []),
];
const PRODUCT_IMAGE_HOST_MESSAGE =
  `URL gambar harus menggunakan HTTPS dari ${ALLOWED_PRODUCT_IMAGE_HOSTS.join(", ")}` +
  (supabaseStorageHost
    ? `; URL Supabase harus berasal dari bucket ${PRODUCT_IMAGES_BUCKET}`
    : "");

export const productImageSchema = z
  .string()
  .trim()
  .url("URL gambar tidak valid")
  .refine((value) => {
    try {
      const url = new URL(value);
      if (
        url.protocol !== "https:" ||
        !ALLOWED_PRODUCT_IMAGE_HOSTS.some((host) => host === url.hostname)
      ) {
        return false;
      }

      return (
        url.hostname !== supabaseStorageHost ||
        (url.port === supabaseStorageUrl?.port &&
          url.search === "" &&
          url.pathname.startsWith(
            `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`,
          ))
      );
    } catch {
      return false;
    }
  }, PRODUCT_IMAGE_HOST_MESSAGE);

const productImagesFormSchema = z.string().superRefine((value, context) => {
  const images = value
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);

  if (images.length === 0) {
    context.addIssue({
      code: "custom",
      message: "Masukkan minimal 1 URL gambar",
    });
    return;
  }

  if (images.length > MAX_PRODUCT_IMAGES) {
    context.addIssue({
      code: "custom",
      message: `Maksimal ${MAX_PRODUCT_IMAGES} gambar per produk`,
    });
  }

  images.forEach((image, index) => {
    const result = productImageSchema.safeParse(image);
    if (!result.success) {
      context.addIssue({
        code: "custom",
        message: `Baris ${index + 1}: ${result.error.issues[0].message}`,
      });
    }
  });
});

export const productSchema = productBaseSchema.extend({
  slug: z.string().min(1, "Slug produk wajib diisi").max(100),
  images: z
    .array(productImageSchema)
    .min(1, "Masukkan minimal 1 URL gambar")
    .max(MAX_PRODUCT_IMAGES, `Maksimal ${MAX_PRODUCT_IMAGES} gambar per produk`),
  // null = hapus badge (undefined akan hilang saat JSON.stringify di client,
  // sehingga PATCH tidak pernah menyentuh kolom badge).
  badge: productBadgeSchema.nullable().optional(),
});

export type ProductSchema = z.infer<typeof productSchema>;

export const productFormSchema = productBaseSchema.extend({
  images: productImagesFormSchema,
  badge: z.enum(["best-seller", "new", "sold-out", ""]).optional(),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;

export const testimonialSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(60, "Nama maksimal 60 karakter"),
  role: z
    .string()
    .max(40, "Peran maksimal 40 karakter")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .min(10, "Testimoni minimal 10 karakter")
    .max(300, "Testimoni maksimal 300 karakter"),
  rating: z
    .number({ error: "Pilih rating bintang" })
    .int()
    .min(1, "Rating minimal 1 bintang")
    .max(5, "Rating maksimal 5 bintang"),
});

export type TestimonialSchema = z.infer<typeof testimonialSchema>;
