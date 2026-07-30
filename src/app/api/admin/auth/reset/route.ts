import { NextResponse } from "next/server";
import {
  checkRateLimit,
  consumePasswordResetToken,
  getClientIp,
  hashPassword,
  validatePassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`reset:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "");
  const password = String(body.password || "");
  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const user = await consumePasswordResetToken(token);
  if (!user) {
    return NextResponse.json(
      { error: "Link inválido ou expirado" },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password) },
  });

  return NextResponse.json({ ok: true });
}
