import { describe, it, expect } from "vitest";
import {
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
  type AdminSession,
} from "./session-token";

const SECRET = "test-secret-with-at-least-32-characters-long!!";

describe("session-token", () => {
  it("creates a token in payload.signature format", async () => {
    const session: AdminSession = { email: "admin@example.com", loggedAt: Date.now() };
    const token = await createSessionToken(session, SECRET);

    const parts = token.split(".");
    expect(parts).toHaveLength(2);
    expect(parts[0]).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(parts[1]).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("round-trips a valid session", async () => {
    const session: AdminSession = { email: "admin@example.com", loggedAt: Date.now() };
    const token = await createSessionToken(session, SECRET);

    const verified = await verifySessionToken(token, SECRET, SESSION_MAX_AGE);
    expect(verified).not.toBeNull();
    expect(verified?.email).toBe("admin@example.com");
    expect(verified?.loggedAt).toBe(session.loggedAt);
  });

  it("rejects a token signed with a different secret", async () => {
    const session: AdminSession = { email: "admin@example.com", loggedAt: Date.now() };
    const token = await createSessionToken(session, SECRET);

    const verified = await verifySessionToken(token, "another-secret-value-abcdefghijklmn", SESSION_MAX_AGE);
    expect(verified).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const session: AdminSession = { email: "admin@example.com", loggedAt: Date.now() };
    const token = await createSessionToken(session, SECRET);
    const [, signature] = token.split(".");

    // Forge a payload claiming a different email but keep old signature.
    const forgedPayload = Buffer.from(
      JSON.stringify({ email: "attacker@example.com", loggedAt: Date.now() }),
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

    const forged = `${forgedPayload}.${signature}`;
    const verified = await verifySessionToken(forged, SECRET, SESSION_MAX_AGE);
    expect(verified).toBeNull();
  });

  it("rejects a malformed token (wrong number of parts)", async () => {
    expect(await verifySessionToken("only-one-part", SECRET)).toBeNull();
    expect(await verifySessionToken("a.b.c", SECRET)).toBeNull();
    expect(await verifySessionToken("", SECRET)).toBeNull();
  });

  it("rejects a token with invalid characters", async () => {
    expect(await verifySessionToken("bad payload.signature", SECRET)).toBeNull();
    expect(await verifySessionToken("payload.bad signature", SECRET)).toBeNull();
  });

  it("rejects an expired token", async () => {
    const oldSession: AdminSession = {
      email: "admin@example.com",
      loggedAt: Date.now() - (SESSION_MAX_AGE + 60) * 1000,
    };
    const token = await createSessionToken(oldSession, SECRET);

    const verified = await verifySessionToken(token, SECRET, SESSION_MAX_AGE);
    expect(verified).toBeNull();
  });

  it("rejects a token with a future loggedAt (clock skew abuse)", async () => {
    const futureSession: AdminSession = {
      email: "admin@example.com",
      loggedAt: Date.now() + 10 * 60 * 1000,
    };
    const token = await createSessionToken(futureSession, SECRET);

    const verified = await verifySessionToken(token, SECRET, SESSION_MAX_AGE);
    expect(verified).toBeNull();
  });

  it("rejects a token whose payload has missing/invalid fields", async () => {
    // Valid signature but payload lacks email.
    const badPayloadObj = { loggedAt: Date.now() };
    const payload = Buffer.from(JSON.stringify(badPayloadObj))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

    // Re-sign the bad payload correctly so only the shape check should reject it.
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sigBuf = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload),
    );
    const sig = Buffer.from(new Uint8Array(sigBuf))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

    const verified = await verifySessionToken(`${payload}.${sig}`, SECRET);
    expect(verified).toBeNull();
  });
});