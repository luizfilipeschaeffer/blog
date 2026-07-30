import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSettings } from "@/lib/blog/services";
import { prisma } from "@/lib/prisma";

async function guard() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await request.json();
  const settings = await prisma.blogSettings.upsert({
    where: { id: 1 },
    update: {
      publisherName: String(body.publisherName || "SSR Blog Kit"),
      defaultAuthorName: String(body.defaultAuthorName || "Luiz Filipe Schaeffer"),
      defaultAuthorUserId: body.defaultAuthorUserId || null,
      defaultOgImageUrl: String(body.defaultOgImageUrl || ""),
      syndicationFooter: String(body.syndicationFooter || ""),
      publicBaseUrl: String(body.publicBaseUrl || ""),
    },
    create: {
      id: 1,
      publisherName: String(body.publisherName || "SSR Blog Kit"),
      defaultAuthorName: String(body.defaultAuthorName || "Luiz Filipe Schaeffer"),
      defaultAuthorUserId: body.defaultAuthorUserId || null,
      defaultOgImageUrl: String(body.defaultOgImageUrl || ""),
      syndicationFooter: String(body.syndicationFooter || ""),
      publicBaseUrl: String(body.publicBaseUrl || ""),
    },
  });
  return NextResponse.json(settings);
}
