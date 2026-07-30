import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/blog/utils";

async function guard() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const authors = await prisma.blogAuthor.findMany({
    orderBy: { displayName: "asc" },
  });
  return NextResponse.json(authors);
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await request.json();
  const displayName = String(body.displayName || "").trim();
  if (!displayName) {
    return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
  }
  const handle = slugify(body.handle || displayName).replace(/-/g, "") || "autor";
  const author = await prisma.blogAuthor.create({
    data: {
      displayName,
      handle,
      avatarUrl: String(body.avatarUrl || ""),
    },
  });
  return NextResponse.json(author, { status: 201 });
}
