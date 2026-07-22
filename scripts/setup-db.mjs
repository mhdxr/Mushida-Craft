/**
 * Database setup script — menjalankan SQL migration ke Supabase (Postgres).
 *
 * Cara pakai:
 *   1. Set SUPABASE_DB_URL di .env.local
 *      (Supabase Dashboard > Project Settings > Database > Connection string > URI)
 *   2. Jalankan: npm run db:setup
 *
 * Script menjalankan seluruh file .sql di supabase/migrations sesuai urutan
 * nama. Setiap file migration harus aman dijalankan berulang.
 *
 * Catatan: Connection string dari Supabase biasanya format:
 *   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
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

const MIGRATIONS_DIR = resolve(projectRoot, "supabase", "migrations");

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

  if (!existsSync(MIGRATIONS_DIR)) {
    console.error(`\n❌ Folder migration tidak ditemukan: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }

  const migrationFiles = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  if (migrationFiles.length === 0) {
    console.error(`\n❌ Tidak ada file migration di: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }

  // ── Koneksi & eksekusi ───────────────────────────────────────────────────
  console.log("🔌 Menghubungkan ke database...");
  // Default: SSL ketat (rejectUnauthorized:true).
  // Hanya longgarkan bila DB_SSL_INSECURE=1 (Windows/Node + intermediate CA
  // Supabase pooler kadang gagal verifikasi).
  const isSupabase = /supabase\.com/i.test(DB_URL);
  const allowInsecure = process.env.DB_SSL_INSECURE === "1";
  const client = new Client({
    connectionString: DB_URL,
    ssl: isSupabase ? { rejectUnauthorized: !allowInsecure } : undefined,
  });

  try {
    await client.connect();
    console.log("✅ Terhubung ke database.");

    const productsTable = await client.query(
      "SELECT to_regclass('public.products') as table_name",
    );
    const productsAlreadyExist = Boolean(productsTable.rows[0]?.table_name);

    for (const migrationFile of migrationFiles) {
      if (migrationFile === "0001_products.sql" && productsAlreadyExist) {
        console.log("⏭️  Melewati 0001_products.sql (tabel products sudah ada).");
        continue;
      }

      console.log(`⚙️  Menjalankan ${migrationFile}...`);
      const sql = readFileSync(resolve(MIGRATIONS_DIR, migrationFile), "utf-8");
      await client.query(sql);
    }

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
