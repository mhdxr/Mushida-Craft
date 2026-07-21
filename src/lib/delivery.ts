/**
 * Info area layanan & cut-off same-day (env-driven).
 * Semua NEXT_PUBLIC_* di-inline saat build — ganti env + redeploy.
 *
 * Default sengaja generik/jujur agar tidak mengarang kota
 * sebelum owner mengisi data operasional.
 */

export interface DeliveryInfo {
  /** Kota basis, mis. "Bekasi". Kosong = tidak disebut. */
  city: string | null;
  /** Area same-day, mis. "Bekasi, Cikarang, Jaktim". */
  areas: string[];
  /** Cut-off same-day, format tampilan "15.00". */
  cutoff: string;
  /** Jam operasional CS, mis. "Senin–Sabtu · 09.00–18.00 WIB". */
  hours: string;
  /** Catatan pickup opsional. */
  pickupNote: string | null;
}

function trimOrNull(value: string | undefined): string | null {
  const v = value?.trim();
  return v ? v : null;
}

function parseAreas(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Normalisasi "15:00" / "15.00" / "3pm" sederhana → label "15.00". */
function formatCutoff(raw: string | undefined): string {
  const v = (raw ?? "15:00").trim();
  const m = v.match(/^(\d{1,2})[:.](\d{2})$/);
  if (m) {
    const h = m[1].padStart(2, "0");
    return `${h}.${m[2]}`;
  }
  return v || "15.00";
}

export function getDeliveryInfo(): DeliveryInfo {
  return {
    city: trimOrNull(process.env.NEXT_PUBLIC_SERVICE_CITY),
    areas: parseAreas(process.env.NEXT_PUBLIC_SERVICE_AREAS),
    cutoff: formatCutoff(process.env.NEXT_PUBLIC_SAME_DAY_CUTOFF),
    hours:
      trimOrNull(process.env.NEXT_PUBLIC_BUSINESS_HOURS) ||
      "Senin–Sabtu · 09.00–18.00 WIB",
    pickupNote: trimOrNull(process.env.NEXT_PUBLIC_PICKUP_NOTE),
  };
}

/** Ringkas 1 kalimat untuk kartu PDP / trust. */
export function buildDeliverySummary(info: DeliveryInfo = getDeliveryInfo()): string {
  const areaLabel =
    info.areas.length > 0
      ? info.areas.join(", ")
      : info.city
        ? `${info.city} & sekitarnya`
        : "area jangkauan kami";

  return `Same-day ke ${areaLabel}. Order sebelum pukul ${info.cutoff} WIB (slot menyesuaikan antrean).`;
}

/** List bullet untuk section info pengiriman. */
export function buildDeliveryBullets(
  info: DeliveryInfo = getDeliveryInfo(),
): string[] {
  const bullets: string[] = [];

  if (info.city) {
    bullets.push(`Berbasis di ${info.city}`);
  }

  if (info.areas.length > 0) {
    bullets.push(`Area same-day: ${info.areas.join(", ")}`);
  } else {
    bullets.push("Area same-day: konfirmasi via WhatsApp");
  }

  bullets.push(
    `Cut-off same-day: pukul ${info.cutoff} WIB (di luar jam itu = H+1 / jadwal menyusul)`,
  );
  bullets.push(`Jam respon admin: ${info.hours}`);

  if (info.pickupNote) {
    bullets.push(info.pickupNote);
  }

  bullets.push("Luar area: tetap bisa order — ongkir & estimasi via WhatsApp");

  return bullets;
}
