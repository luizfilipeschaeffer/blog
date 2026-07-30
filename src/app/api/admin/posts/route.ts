import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  createPost,
  createPostFromTemplate,
  deletePost,
  getPostAdmin,
  listAllPostsAdmin,
  updatePost,
  type PostInput,
} from "@/lib/blog/services";

async function guard() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return null;
}

export async function GET(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    const post = await getPostAdmin(id);
    if (!post) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    return NextResponse.json(post);
  }
  const posts = await listAllPostsAdmin({
    status: searchParams.get("status") || undefined,
    q: searchParams.get("q") || undefined,
  });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await request.json();
  if (body.templateId && body.fromTemplate) {
    const post = await createPostFromTemplate(body.templateId);
    return NextResponse.json(post, { status: 201 });
  }
  const input = body as PostInput;
  if (!input.title?.trim()) {
    return NextResponse.json({ error: "Título obrigatório" }, { status: 400 });
  }
  const post = await createPost(input);
  return NextResponse.json(post, { status: 201 });
}

export async function PUT(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }
  const post = await updatePost(body.id, body as PostInput);
  if (!post) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(post);
}

export async function DELETE(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  await deletePost(id);
  return NextResponse.json({ ok: true });
}
