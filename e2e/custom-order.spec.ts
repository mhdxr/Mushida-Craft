import { test, expect } from "@playwright/test";

test.describe("Alur Pemesanan Kustom (Custom Order)", () => {
  test("Harus dapat mengisi form pemesanan dan mengarahkan ke WhatsApp", async ({
    page,
    context,
  }) => {
    // 1. Kunjungi halaman /custom-order
    await page.goto("/custom-order");
    await expect(
      page.getByRole("heading", { name: /Rangkaian impianmu, kami yang racik/i })
    ).toBeVisible();

    // 2. Isi form pemesanan dengan data valid
    // Nama Lengkap
    await page.getByLabel(/Nama lengkap/i).fill("Budi Santoso");

    // WhatsApp
    await page.getByLabel(/Nomor WhatsApp/i).fill("081234567890");

    // Kategori (Jenis bouquet)
    const categorySelect = page.getByRole("combobox", {
      name: /Jenis bouquet/i,
    });
    await categorySelect.click();
    await page.getByRole("option", { name: "Snack" }).click();

    // Momen
    const occasionSelect = page.getByRole("combobox", { name: /Momen/i });
    await occasionSelect.click();
    await page.getByRole("option", { name: "Ulang tahun" }).click();

    // Budget
    const budgetSelect = page.getByRole("combobox", { name: /Budget/i });
    await budgetSelect.click();
    await page.getByRole("option", { name: "Rp300.000 - Rp500.000" }).click();

    // Area pengiriman
    const deliverySelect = page.getByRole("combobox", { name: /Area pengiriman/i });
    await deliverySelect.click();
    await page.getByRole("option", { name: "Jakarta Selatan" }).click();

    // Tanggal Dibutuhkan (Tanggal masa depan)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateString = futureDate.toISOString().split("T")[0];
    await page.getByLabel(/Tanggal dibutuhkan/i).fill(dateString);

    // Catatan
    await page
      .getByLabel(/Catatan tambahan/i)
      .fill(
        "Tolong buatkan buket snack warna dominan merah."
      );

    // 3. Tangkap URL baru/tab baru (Simulasi klik kirim)
    // Karena kita mengarah ke wa.me (eksternal), kita tangkap pop-up/tab baru
    const pagePromise = context.waitForEvent("page");
    await page.getByRole("button", { name: /Kirim ke WhatsApp/i }).click();
    
    // 4. Verifikasi bahwa pengguna diarahkan ke URL WhatsApp yang benar
    const newPage = await pagePromise;
    
    // Tunggu hingga URL pindah ke WhatsApp (punya auto-retry)
    await expect(newPage).toHaveURL(/api\.whatsapp\.com/);

    // Ekspektasi: Terdapat data pesanan dalam parameter text URL
    const url = new URL(newPage.url());
    const textParam = url.searchParams.get("text") || "";
    expect(textParam).toContain("Budi Santoso");
    expect(textParam).toContain("081234567890");
    expect(textParam).toContain("Snack");
    expect(textParam).toContain("Rp300.000 - Rp500.000");
    expect(textParam).toContain("merah");
  });
});