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
  const categories = await prisma.blogCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await request.json();
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
  const slug = slugify(body.slug || name);
  const category = await prisma.blogCategory.create({
    data: {
      name,
      slug,
      sortOrder: Number(body.sortOrder || 0),
      published: body.published !== false,
      defaultCoverUrl: String(body.defaultCoverUrl || ""),
    },
  });
  return NextResponse.json(category, { status: 201 });
}

export async function PUT(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  const category = await prisma.blogCategory.update({
    where: { id: body.id },
    data: {
      name: String(body.name || "").trim(),
      slug: slugify(body.slug || body.name),
      sortOrder: Number(body.sortOrder || 0),
      published: body.published !== false,
      defaultCoverUrl: String(body.defaultCoverUrl || ""),
    },
  });
  return NextResponse.json(category);
}

export async function DELETE(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  await prisma.blogCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
