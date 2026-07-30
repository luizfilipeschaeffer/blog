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
  const templates = await prisma.blogTemplate.findMany({
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await request.json();
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
  const template = await prisma.blogTemplate.create({
    data: {
      name,
      slug: slugify(body.slug || name),
      description: String(body.description || ""),
      categoryId: body.categoryId || null,
      titlePrefix: String(body.titlePrefix || ""),
      excerptHint: String(body.excerptHint || ""),
      bodySkeleton: String(body.bodySkeleton || ""),
      metaTitlePattern: String(body.metaTitlePattern || ""),
      metaDescriptionHint: String(body.metaDescriptionHint || ""),
      defaultCoverUrl: String(body.defaultCoverUrl || ""),
      sortOrder: Number(body.sortOrder || 0),
      active: body.active !== false,
    },
  });
  return NextResponse.json(template, { status: 201 });
}

export async function PUT(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  const template = await prisma.blogTemplate.update({
    where: { id: body.id },
    data: {
      name: String(body.name || "").trim(),
      slug: slugify(body.slug || body.name),
      description: String(body.description || ""),
      categoryId: body.categoryId || null,
      titlePrefix: String(body.titlePrefix || ""),
      excerptHint: String(body.excerptHint || ""),
      bodySkeleton: String(body.bodySkeleton || ""),
      metaTitlePattern: String(body.metaTitlePattern || ""),
      metaDescriptionHint: String(body.metaDescriptionHint || ""),
      defaultCoverUrl: String(body.defaultCoverUrl || ""),
      sortOrder: Number(body.sortOrder || 0),
      active: body.active !== false,
    },
  });
  return NextResponse.json(template);
}

export async function DELETE(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  await prisma.blogTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
