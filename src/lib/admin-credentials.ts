/**
 * Guard kredensial admin di production.
 *
 * Dicek saat server boot (instrumentation) agar deployment
 * dengan password lemah/default tidak bisa jalan di production.
 */

const WEAK_ADMIN_PASSWORDS = new Set([
  "changeme123",
  "password",
  "password123",
  "admin",
  "admin123",
  "12345678",
  "123456789012",
]);

/** Password admin dianggap lemah jika kosong, terlalu pendek, atau ada di daftar default. */
export function isWeakAdminPassword(password: string | undefined): boolean {
  if (!password) return true;
  if (password.length < 12) return true;
  return WEAK_ADMIN_PASSWORDS.has(password.toLowerCase());
}

/**
 * Lempar error jika production memakai kredensial admin yang tidak aman.
 * No-op di development agar setup lokal tetap mudah.
 */
export function assertProductionAdminCredentials(): void {
  if (process.env.NODE_ENV !== "production") return;

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email) {
    throw new Error(
      "ADMIN_EMAIL wajib diisi di production. Lihat .env.example.",
    );
  }

  if (isWeakAdminPassword(password)) {
    throw new Error(
      "ADMIN_PASSWORD di production kosong, terlalu pendek (<12), atau memakai nilai default yang lemah. Ganti dengan password kuat sebelum deploy.",
    );
  }

  if (!process.env.SESSION_SECRET?.trim()) {
    throw new Error(
      "SESSION_SECRET wajib diisi di production. Gunakan nilai acak yang kuat.",
    );
  }
}
