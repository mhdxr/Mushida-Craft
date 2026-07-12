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
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const productSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter").max(80),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(800, "Deskripsi maksimal 800 karakter"),
  price: z
    .number({ invalid_type_error: "Harga harus berupa angka" })
    .min(1000, "Harga minimal Rp1.000"),
  category: z.enum([
    "hand-bouquet",
    "wedding",
    "graduation",
    "anniversary",
    "money-bouquet",
    "dried-flower",
  ]),
  images: z.string().min(5, "Masukkan minimal 1 URL gambar"),
  badge: z.enum(["best-seller", "new", "sold-out", ""]).optional(),
  isAvailable: z.boolean(),
});

export type ProductSchema = z.infer<typeof productSchema>;
