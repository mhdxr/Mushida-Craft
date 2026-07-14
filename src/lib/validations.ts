import { z } from "zod";

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
  password: z.string().min(6, "Password minimal 6 karakter"),
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
    "hand-bouquet",
    "wedding",
    "graduation",
    "anniversary",
    "money-bouquet",
    "dried-flower",
  ]),
  isAvailable: z.boolean(),
});

const productBadgeSchema = z.enum(["best-seller", "new", "sold-out"]);
const ALLOWED_PRODUCT_IMAGE_HOSTS = [
  "images.unsplash.com",
  "plus.unsplash.com",
] as const;
const PRODUCT_IMAGE_HOST_MESSAGE =
  "URL gambar harus menggunakan HTTPS dari images.unsplash.com atau plus.unsplash.com";

const productImageSchema = z
  .string()
  .trim()
  .url("URL gambar tidak valid")
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        url.protocol === "https:" &&
        ALLOWED_PRODUCT_IMAGE_HOSTS.some((host) => host === url.hostname)
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
  images: z.array(productImageSchema).min(1, "Masukkan minimal 1 URL gambar"),
  badge: productBadgeSchema.optional(),
});

export type ProductSchema = z.infer<typeof productSchema>;

export const productFormSchema = productBaseSchema.extend({
  images: productImagesFormSchema,
  badge: z.enum(["best-seller", "new", "sold-out", ""]).optional(),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;
