import { describe, it, expect } from "vitest";
import { hasValidImageSignature } from "./product-images";
import { hasValidAvatarSignature } from "./testimonial-avatar";

// Helper: Uint8Array dari hex string (mis. "ffd8ff" → [0xff, 0xd8, 0xff])
function bytesFromHex(hex: string): Uint8Array {
  const clean = hex.replace(/\s/g, "");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// Signature nyata format gambar
const JPEG = "ffd8ffe000104a464946";
const PNG =
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489";
const WEBP =
  "524946461a00000057454250565038582000000000000000000000000000000000";
const AVIF =
  "0000001c66747970617669660000000000000000000000000000000000";

describe("hasValidImageSignature (produk — route upload)", () => {
  it("menerima JPEG valid", () => {
    expect(hasValidImageSignature(bytesFromHex(JPEG), "image/jpeg")).toBe(true);
  });

  it("menerima PNG valid", () => {
    expect(hasValidImageSignature(bytesFromHex(PNG), "image/png")).toBe(true);
  });

  it("menerima WebP valid", () => {
    expect(hasValidImageSignature(bytesFromHex(WEBP), "image/webp")).toBe(true);
  });

  it("menerima AVIF valid", () => {
    expect(hasValidImageSignature(bytesFromHex(AVIF), "image/avif")).toBe(true);
  });

  it("menolak file HTML yang di-rename jadi .jpg", () => {
    const html = new TextEncoder().encode(
      "<html><script>alert(1)</script></html>",
    );
    expect(hasValidImageSignature(html, "image/jpeg")).toBe(false);
  });

  it("menolak file teks polos yang di-rename jadi .png", () => {
    const text = new TextEncoder().encode("plain text bukan gambar");
    expect(hasValidImageSignature(text, "image/png")).toBe(false);
  });

  it("menolak SVG (XML) yang di-rename jadi .jpg — cegah XSS via SVG", () => {
    const svg = new TextEncoder().encode(
      '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    );
    expect(hasValidImageSignature(svg, "image/jpeg")).toBe(false);
  });

  it("menolak file kosong", () => {
    expect(hasValidImageSignature(new Uint8Array(0), "image/png")).toBe(false);
  });

  it("menolak mismatch: file PNG valid diklaim sebagai JPEG", () => {
    expect(hasValidImageSignature(bytesFromHex(PNG), "image/jpeg")).toBe(false);
  });

  it("menolak mismatch: file JPEG valid diklaim sebagai PNG", () => {
    expect(hasValidImageSignature(bytesFromHex(JPEG), "image/png")).toBe(false);
  });
});

describe("hasValidAvatarSignature (testimoni)", () => {
  it("menerima JPEG/PNG/WebP valid", () => {
    expect(hasValidAvatarSignature(bytesFromHex(JPEG), "image/jpeg")).toBe(true);
    expect(hasValidAvatarSignature(bytesFromHex(PNG), "image/png")).toBe(true);
    expect(hasValidAvatarSignature(bytesFromHex(WEBP), "image/webp")).toBe(true);
  });

  it("menolak file non-gambar yang di-rename jadi avatar", () => {
    const exe = bytesFromHex("4d5a90000300000004000000ffff0000b800000000000000");
    expect(hasValidAvatarSignature(exe, "image/jpeg")).toBe(false);
  });

  it("menolak input di luar format avatar (hanya JPEG/PNG/WebP)", () => {
    // AVIF bukan format avatar; pastikan input asing tidak lolos.
    // TypeScript tidak mengizinkan "image/avif" sebagai AvatarMimeType,
    // jadi kita panggil lewat type assertion (simulasi input runtime salah).
    expect(
      hasValidAvatarSignature(
        bytesFromHex(AVIF),
        "image/avif" as "image/jpeg",
      ),
    ).toBe(false);
  });

  it("menolak file kosong", () => {
    expect(hasValidAvatarSignature(new Uint8Array(0), "image/jpeg")).toBe(false);
  });
});
