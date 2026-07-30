import { NextResponse } from "next/server";
import {
  createPasswordResetToken,
  getSessionUser,
  hashPassword,
  requireAdminUser,
  validatePassword,
} from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

async function guardAdmin() {
  try {
    return await requireAdminUser();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHORIZED";
    if (message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}

export async function GET() {
  const denied = await guardAdmin();
  if (denied instanceof NextResponse) return denied;
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const denied = await guardAdmin();
  if (denied instanceof NextResponse) return denied;

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const name = String(body.name || "").trim();
  const role = body.role === "admin" ? "admin" : "editor";
  const password = String(body.password || "");
  const sendInvite = Boolean(body.sendInvite);

  if (!email || !name) {
    return NextResponse.json(
      { error: "Nome e e-mail são obrigatórios" },
      { status: 400 },
    );
  }

  if (!sendInvite) {
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe um usuário com este e-mail" },
      { status: 409 },
    );
  }

  const tempPassword =
    password || `Tmp-${Math.random().toString(36).slice(2)}9!`;
  const user = await prisma.user.create({
    data: {
      email,
      name,
      role,
      passwordHash: await hashPassword(tempPassword),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (sendInvite) {
    try {
      const token = await createPasswordResetToken(user.id);
      const base = (
        process.env.PUBLIC_URL || "http://localhost:3000"
      ).replace(/\/$/, "");
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl: `${base}/admin/reset-password?token=${encodeURIComponent(token)}`,
      });
    } catch (error) {
      console.error("invite email failed", error);
    }
  }

  return NextResponse.json(user, { status: 201 });
}

export async function PUT(request: Request) {
  const denied = await guardAdmin();
  if (denied instanceof NextResponse) return denied;
  const actor = denied;

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const name = body.name !== undefined ? String(body.name).trim() : target.name;
  const role =
    body.role === "admin" || body.role === "editor" ? body.role : target.role;

  if (target.role === "admin" && role !== "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Não é possível remover o último admin" },
        { status: 400 },
      );
    }
  }

  const data: {
    name: string;
    role: "admin" | "editor";
    passwordHash?: string;
  } = { name, role };

  if (body.password) {
    const passwordError = validatePassword(String(body.password));
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }
    data.passwordHash = await hashPassword(String(body.password));
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // keep actor in scope for future audit logs
  void actor;
  return NextResponse.json(user);
}

export async function DELETE(request: Request) {
  const denied = await guardAdmin();
  if (denied instanceof NextResponse) return denied;
  const actor = await getSessionUser();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  if (actor?.id === id) {
    return NextResponse.json(
      { error: "Você não pode excluir a própria conta" },
      { status: 400 },
    );
  }

  if (target.role === "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Não é possível excluir o último admin" },
        { status: 400 },
      );
    }
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
