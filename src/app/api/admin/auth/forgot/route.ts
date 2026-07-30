import { NextResponse } from "next/server";
import {
  checkRateLimit,
  createPasswordResetToken,
  getClientIp,
} from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`forgot:${ip}`, 8, 60_000)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "")
    .trim()
    .toLowerCase();

  // Always return the same message to avoid account enumeration
  const generic = {
    ok: true,
    message:
      "Se existir uma conta com este e-mail, enviamos um link de redefinição.",
  };

  if (!email) return NextResponse.json(generic);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json(generic);

  try {
    const token = await createPasswordResetToken(user.id);
    const base = (
      process.env.PUBLIC_URL || "http://localhost:3000"
    ).replace(/\/$/, "");
    const resetUrl = `${base}/admin/reset-password?token=${encodeURIComponent(token)}`;
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });
  } catch (error) {
    console.error("forgot-password email failed", error);
  }

  return NextResponse.json(generic);
}
