import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  authenticateUser,
  checkRateLimit,
  createSessionToken,
  getClientIp,
  getSessionUser,
} from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({
    authenticated: Boolean(user),
    user: user
      ? { id: user.id, email: user.email, name: user.name, role: user.role }
      : null,
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`login:${ip}`, 20, 60_000)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "");
  const password = String(body.password || "");
  const user = await authenticateUser(email, password);
  if (!user) {
    return NextResponse.json(
      { error: "E-mail ou senha inválidos" },
      { status: 401 },
    );
  }

  const token = createSessionToken(user.id);
  const res = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
