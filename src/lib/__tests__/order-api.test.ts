import { describe, expect, it } from "vitest";
import {
  buildCustomOrderPayload,
  buildLocalCustomOrderUrl,
  buildProductOrderPayload,
} from "@/lib/order-api";

// ── Fixture ──
const productFixture = {
  id: "p1",
  slug: "bouquet-pinky",
  name: "Bouquet Pinky",
  price: 150000,
  category: "snack-bouquet",
};

// Form shape (dipakai buildCustomOrderPayload)
const customFormFixture = {
  name: "Anindya Putri",
  whatsapp: "081234567890",
  bouquetType: "Snack",
  occasion: "Ulang tahun",
  budget: "Rp300.000 - Rp500.000",
  neededDate: "2026-08-15",
  deliveryArea: "Jakarta Barat (same-day)",
  notes: "Tolong tambahkan kartu ucapan",
};

// Payload shape (dipakai buildLocalCustomOrderUrl / placeOrder)
const customPayloadFixture = {
  source: "custom",
  customerName: "Anindya Putri",
  customerWa: "081234567890",
  bouquetType: "Snack",
  occasion: "Ulang tahun",
  budget: "Rp300.000 - Rp500.000",
  neededDate: "2026-08-15",
  deliveryArea: "Jakarta Barat (same-day)",
  notes: "Tolong tambahkan kartu ucapan",
};

describe("order-api: payload builder", () => {
  it("buildProductOrderPayload memetakan produk ke payload API", () => {
    const payload = buildProductOrderPayload(productFixture as never);
    expect(payload.source).toBe("product");
    expect(payload.productName).toBe("Bouquet Pinky");
    expect(payload.productPrice).toBe(150000);
    expect(payload.category).toBe("Snack"); // dari categoryMap
  });

  it("buildCustomOrderPayload memetakan form ke payload API", () => {
    const payload = buildCustomOrderPayload(customFormFixture as never);
    expect(payload.source).toBe("custom");
    expect(payload.customerName).toBe("Anindya Putri");
    expect(payload.customerWa).toBe("081234567890");
    expect(payload.neededDate).toBe("2026-08-15");
  });
});

describe("order-api: fallback lokal", () => {
  it("fallback custom order menghasilkan link WA dengan nama pemesan (bukan undefined)", () => {
    const url = buildLocalCustomOrderUrl(customPayloadFixture as never);
    expect(url.startsWith("https://wa.me/")).toBe(true);
    // Nama pemesan tidak boleh "undefined"
    expect(url).not.toContain("undefined");
    expect(decodeURIComponent(url)).toContain("Anindya Putri");
    expect(decodeURIComponent(url)).toContain("081234567890");
  });

  it("fallback custom order dengan field kosong memakai placeholder (bukan undefined)", () => {
    const url = buildLocalCustomOrderUrl({ source: "custom" } as never);
    expect(url).not.toContain("undefined");
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("Nama: —");
    expect(decoded).toContain("WhatsApp: —");
  });
});
