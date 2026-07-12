"use client";

const SESSION_KEY = "Mushida:admin-session";

export interface AdminSession {
  email: string;
  loggedAt: number;
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(email: string) {
  if (typeof window === "undefined") return;
  const session: AdminSession = { email, loggedAt: Date.now() };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}
