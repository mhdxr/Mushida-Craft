import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email dan password wajib diisi." },
        { status: 400 },
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Kredensial admin belum diset. Atur ADMIN_EMAIL dan ADMIN_PASSWORD pada .env.",
        },
        { status: 500 },
      );
    }

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { ok: false, message: "Email atau password salah." },
        { status: 401 },
      );
    }

    return NextResponse.json({ ok: true, email });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Permintaan tidak valid." },
      { status: 400 },
    );
  }
}
