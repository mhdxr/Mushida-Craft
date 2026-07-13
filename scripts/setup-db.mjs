/**
 * Database setup script — menjalankan SQL migration ke Supabase (Postgres).
 *
 * Cara pakai:
 *   1. Set SUPABASE_DB_URL di .env.local
 *      (Supabase Dashboard > Project Settings > Database > Connection string > URI)
 *   2. Jalankan: npm run db:setup
 *
 * Script ini idempotent — aman dijalankan berulang. SQL migration menggunakan
 * "if not exists" dan hanya insert seed jika tabel kosong.
 *
 * Catatan: Connection string dari Supabase biasanya format:
 *   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const { Client } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// Load .env.local lalu .env (prioritas .env.local).
dotenv.config({ path: resolve(projectRoot, ".env.local") });
dotenv.config({ path: resolve(projectRoot, ".env") });

const DB_URL =
  process.env.SUPABASE_DB_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

const MIGRATION_FILE = resolve(
  projectRoot,
  "supabase",
  "migrations",
  "0001_products.sql",
);

async function main() {
  // ── Validasi ─────────────────────────────────────────────────────────────
  if (!DB_URL) {
    console.error(
      "\n❌ SUPABASE_DB_URL belum diset.\n\n" +
        "Cara dapatkan:\n" +
        "  1. Buka Supabase Dashboard > Project Settings > Database\n" +
        "  2. Bagian 'Connection string' > pilih 'URI'\n" +
        "  3. Copy connection string (format: postgresql://...)\n" +
        "  4. Set di .env.local:\n\n" +
        "     SUPABASE_DB_URL=postgresql://postgres.xxx:password@...\n",
    );
    process.exit(1);
  }

  if (!existsSync(MIGRATION_FILE)) {
    console.error(`\n❌ File migration tidak ditemukan: ${MIGRATION_FILE}`);
    process.exit(1);
  }

  console.log("📄 Membaca migration file...");
  const sql = readFileSync(MIGRATION_FILE, "utf-8");

  // ── Koneksi & eksekusi ───────────────────────────────────────────────────
  console.log("🔌 Menghubungkan ke database...");
  const client = new Client({
    connectionString: DB_URL,
    // Supabase pooler butuh sslmode=require
    ssl: DB_URL.includes("supabase.com")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  try {
    await client.connect();
    console.log("✅ Terhubung ke database.");

    console.log("⚙️  Menjalankan migration...");
    await client.query(sql);

    // Verifikasi hasil
    const result = await client.query(
      "SELECT count(*)::int as total FROM public.products",
    );
    const total = result.rows[0]?.total ?? 0;
    console.log(`\n✅ Migration selesai! Total produk di database: ${total}\n`);
  } catch (err) {
    console.error("\n❌ Gagal menjalankan migration:");
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
