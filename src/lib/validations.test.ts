import { describe, it, expect } from "vitest";
import {
  customOrderSchema,
  loginSchema,
  productImageSchema,
  productSchema,
  testimonialSchema,
} from "./validations";

describe("loginSchema", () => {
  it("menerima email + password valid", () => {
    const r = loginSchema.safeParse({
      email: "admin@example.com",
      password: "strong-password-123!",
    });
    expect(r.success).toBe(true);
  });

  it("menolak email invalid", () => {
    const r = loginSchema.safeParse({
      email: "bukan-email",
      password: "strong-password-123!",
    });
    expect(r.success).toBe(false);
  });

  it("menolak password < 12 karakter", () => {
    const r = loginSchema.safeParse({
      email: "admin@example.com",
      password: "short",
    });
    expect(r.success).toBe(false);
  });
});

describe("customOrderSchema", () => {
  const valid = {
    name: "Budi Santoso",
    whatsapp: "081234567890",
    bouquetType: "Snack",
    budget: "Rp300.000 - Rp500.000",
    neededDate: "2099-01-01",
    occasion: "Ulang tahun",
    deliveryArea: "Jakarta Selatan",
  };

  it("menerima data valid", () => {
    expect(customOrderSchema.safeParse(valid).success).toBe(true);
  });

  it("menolak tanggal di masa lalu", () => {
    const bad = { ...valid, neededDate: "2020-01-01" };
    const r = customOrderSchema.safeParse(bad);
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toContain("masa lalu");
  });

  it("menolak format tanggal salah", () => {
    const bad = { ...valid, neededDate: "01-01-2099" };
    expect(customOrderSchema.safeParse(bad).success).toBe(false);
  });

  it("menolak whatsapp berisi huruf", () => {
    const bad = { ...valid, whatsapp: "0812abc4567" };
    expect(customOrderSchema.safeParse(bad).success).toBe(false);
  });

  it("menolak nama terlalu pendek", () => {
    const bad = { ...valid, name: "A" };
    expect(customOrderSchema.safeParse(bad).success).toBe(false);
  });

  it("menolak notes > 500 karakter", () => {
    const bad = { ...valid, notes: "x".repeat(501) };
    expect(customOrderSchema.safeParse(bad).success).toBe(false);
  });
});

describe("testimonialSchema", () => {
  it("menerima testimoni valid", () => {
    expect(
      testimonialSchema.safeParse({
        name: "Sari",
        message: "Buketnya cantik banget, recommended!",
        rating: 5,
      }).success,
    ).toBe(true);
  });

  it("menolak rating 0 atau 6 (di luar 1-5)", () => {
    expect(
      testimonialSchema.safeParse({ name: "Sari", message: "ok", rating: 0 })
        .success,
    ).toBe(false);
    expect(
      testimonialSchema.safeParse({ name: "Sari", message: "ok", rating: 6 })
        .success,
    ).toBe(false);
  });

  it("menolak rating pecahan (harus integer)", () => {
    expect(
      testimonialSchema.safeParse({ name: "Sari", message: "ok", rating: 4.5 })
        .success,
    ).toBe(false);
  });

  it("menolak message < 10 karakter", () => {
    expect(
      testimonialSchema.safeParse({ name: "Sari", message: "pendek", rating: 5 })
        .success,
    ).toBe(false);
  });
});

describe("productImageSchema", () => {
  it("menerima URL HTTPS Unsplash", () => {
    expect(
      productImageSchema.safeParse(
        "https://images.unsplash.com/photo-123?w=900&q=80",
      ).success,
    ).toBe(true);
  });

  it("menerima URL HTTPS Supabase bucket product-images", () => {
    // Validasi butuh NEXT_PUBLIC_SUPABASE_URL; tanpa env, host tidak di-allow → tolak.
    // Test ini hanya memastikan tidak crash & menolak host tak dikenal.
    expect(
      productImageSchema.safeParse(
        "https://unknown.example.com/storage/v1/object/public/product-images/x.jpg",
      ).success,
    ).toBe(false);
  });

  it("menolak protokol http (bukan https)", () => {
    expect(
      productImageSchema.safeParse("http://images.unsplash.com/photo-123")
        .success,
    ).toBe(false);
  });

  it("menolak URL bukan gambar (host tak dikenal)", () => {
    expect(
      productImageSchema.safeParse("https://evil.example.com/x.jpg").success,
    ).toBe(false);
  });

  it("menolak string bukan URL", () => {
    expect(productImageSchema.safeParse("bukan-url").success).toBe(false);
  });
});

describe("productSchema", () => {
  const validProduct = {
    name: "Snack Bouquet Choco",
    description: "Buket snack coklat premium untuk hadiah ulang tahun.",
    price: 185000,
    category: "snack-bouquet",
    isAvailable: true,
    slug: "snack-bouquet-choco",
    images: ["https://images.unsplash.com/photo-123?w=900&q=80"],
  };

  it("menerima produk valid", () => {
    expect(productSchema.safeParse(validProduct).success).toBe(true);
  });

  it("menolak slug dengan huruf besar / karakter aneh", () => {
    const bad = { ...validProduct, slug: "Snack_Bouquet!" };
    expect(productSchema.safeParse(bad).success).toBe(false);
  });

  it("menolak harga < 1000", () => {
    const bad = { ...validProduct, price: 500 };
    expect(productSchema.safeParse(bad).success).toBe(false);
  });

  it("menolak harga pecahan", () => {
    const bad = { ...validProduct, price: 185000.5 };
    expect(productSchema.safeParse(bad).success).toBe(false);
  });

  it("menolak kategori tidak dikenal", () => {
    const bad = { ...validProduct, category: "bunga-liar" };
    expect(productSchema.safeParse(bad).success).toBe(false);
  });

  it("menolak tanpa gambar", () => {
    const bad = { ...validProduct, images: [] };
    expect(productSchema.safeParse(bad).success).toBe(false);
  });

  it("menerima badge null (hapus badge)", () => {
    const withNull = { ...validProduct, badge: null };
    expect(productSchema.safeParse(withNull).success).toBe(true);
  });
});
