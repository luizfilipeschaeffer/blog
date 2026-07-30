import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { PostsTable } from "@/components/admin/posts-table";
import { Button } from "@/components/ui/button";
import { listAllPostsAdmin } from "@/lib/blog/services";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const posts = await listAllPostsAdmin({
    status: params.status,
    q: params.q,
  });

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Artigos</h1>
          <p className="text-sm text-muted-foreground">
            Liste, filtre e edite publicações.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="size-4" />
            Novo
          </Link>
        </Button>
      </div>
      <PostsTable
        posts={posts.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: p.status,
          categoryName: p.category?.name || null,
          updatedAt: p.updatedAt.toISOString(),
          publishedAt: p.publishedAt?.toISOString() || null,
        }))}
        initialStatus={params.status || "all"}
        initialQuery={params.q || ""}
      />
    </AdminShell>
  );
}
