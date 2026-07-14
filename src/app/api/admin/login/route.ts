import { NextResponse } from "next/server";
import { setAdminSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Data login tidak valid." },
      { status: 400 },
    );
  }

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { ok: false, message: "Data login tidak valid." },
      { status: 400 },
    );
  }

  try {
    const { email, password } = result.data;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("Kredensial admin belum dikonfigurasi.");
      return NextResponse.json(
        { ok: false, message: "Terjadi kesalahan pada server." },
        { status: 500 },
      );
    }

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { ok: false, message: "Email atau password salah." },
        { status: 401 },
      );
    }

    // Set HTTP-only cookie sesi admin (bukan localStorage lagi).
    await setAdminSessionCookie(email);

    return NextResponse.json({ ok: true, email });
  } catch (err) {
    console.error("Gagal memproses login admin:", err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
