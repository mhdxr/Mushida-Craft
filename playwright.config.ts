import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Memuat variabel lingkungan jika ada (misal .env.local)
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

/**
 * Konfigurasi Playwright untuk pengujian End-to-End.
 * Dirancang untuk berjalan bersama server Next.js lokal.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Jalankan tes dalam mode paralel */
  fullyParallel: true,
  /* Gagal build jika ada test.only di CI */
  forbidOnly: !!process.env.CI,
  /* Retries untuk mengatasi flakiness */
  retries: process.env.CI ? 2 : 0,
  /* Pekerja (Workers) untuk menjalankan tes */
  workers: process.env.CI ? 1 : undefined,
  /* Format laporan */
  reporter: "html",
  /* Konfigurasi untuk mengatur cara kerja tes */
  use: {
    /* Base URL agar tes bisa langsung memakai path relatif, misal "/" atau "/custom-order" */
    baseURL: "http://localhost:3000",

    /* Kumpulkan trace jika tes gagal */
    trace: "on-first-retry",
  },

  /* Konfigurasikan proyek browser (saat ini difokuskan di Chromium untuk E2E utama) */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    /* Kita bisa menambahkan Firefox/Webkit nanti bila perlu:
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],

  /* Jalankan server lokal sebelum tes berjalan secara otomatis */
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});