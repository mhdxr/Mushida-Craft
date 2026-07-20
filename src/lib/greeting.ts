/**
 * Sapaan berbasis waktu (WIB / Asia/Jakarta).
 *
 * Aman dipanggil di Server Component maupun Client Component
 * (hanya memakai Intl + Date, tanpa dependency).
 */

export type TimeGreeting =
  | "Selamat pagi"
  | "Selamat siang"
  | "Selamat sore"
  | "Selamat malam";

/** Ambil jam (0–23) dalam zona waktu Asia/Jakarta. */
export function getWibHour(date: Date = new Date()): number {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    hour12: false,
  }).format(date);
  // Beberapa runtime mengembalikan "24" untuk tengah malam — normalisasi ke 0.
  const hour = Number.parseInt(hourStr, 10);
  return hour === 24 ? 0 : hour;
}

/**
 * Sapaan sesuai jam WIB:
 * 00–10 → Selamat pagi
 * 11–14 → Selamat siang
 * 15–17 → Selamat sore
 * 18–23 → Selamat malam
 */
export function getTimeGreeting(date: Date = new Date()): TimeGreeting {
  const hour = getWibHour(date);
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

/** Sapaan + nama, mis. "Selamat pagi, Mushida!" atau "Selamat pagi, admin@...". */
export function getTimeGreetingWithName(
  name?: string,
  date: Date = new Date(),
): string {
  const greeting = getTimeGreeting(date);
  if (!name?.trim()) return greeting;
  return `${greeting}, ${name.trim()}`;
}
