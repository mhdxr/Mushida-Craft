/**
 * Pure session-token helpers (tanpa next/headers).
 *
 * Dipakai ulang oleh:
 * - src/lib/auth.ts (API routes / Server Components, Node runtime)
 * - src/middleware.ts (Edge runtime)
 *
 * Implementasi memakai Web Crypto API agar kompatibel Edge + Node.
 */

export const SESSION_COOKIE = "Mushida:admin-session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari (detik)

export interface AdminSession {
  email: string;
  loggedAt: number;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importHmacKey(
  secret: string,
  usage: KeyUsage[],
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage,
  );
}

/** Buat token sesi bertanda tangan HMAC-SHA256 (format: payload.signature). */
export async function createSessionToken(
  session: AdminSession,
  secret: string,
): Promise<string> {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify(session)),
  );
  const key = await importHmacKey(secret, ["sign"]);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return `${payload}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

/**
 * Verifikasi token sesi admin.
 * Mengembalikan AdminSession jika valid; null jika format/signature/umur invalid.
 */
export async function verifySessionToken(
  raw: string,
  secret: string,
  maxAgeSeconds: number = SESSION_MAX_AGE,
): Promise<AdminSession | null> {
  try {
    const parts = raw.split(".");
    if (parts.length !== 2) return null;

    const [payload, encodedSignature] = parts;
    if (
      !payload ||
      !encodedSignature ||
      !/^[A-Za-z0-9_-]+$/.test(payload) ||
      !/^[A-Za-z0-9_-]+$/.test(encodedSignature)
    ) {
      return null;
    }

    // Salin ke ArrayBuffer murni agar kompatibel dengan BufferSource di TS 5.9.
    const signatureBytes = base64UrlToBytes(encodedSignature);
    const signature = new Uint8Array(signatureBytes).buffer;
    const key = await importHmacKey(secret, ["verify"]);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(payload),
    );
    if (!valid) return null;

    const session = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payload)),
    ) as unknown;
    if (
      typeof session !== "object" ||
      session === null ||
      typeof (session as AdminSession).email !== "string" ||
      !(session as AdminSession).email ||
      typeof (session as AdminSession).loggedAt !== "number" ||
      !Number.isFinite((session as AdminSession).loggedAt)
    ) {
      return null;
    }

    const adminSession = session as AdminSession;
    const ageSeconds = (Date.now() - adminSession.loggedAt) / 1000;
    if (ageSeconds < 0 || ageSeconds > maxAgeSeconds) return null;

    return adminSession;
  } catch {
    return null;
  }
}
