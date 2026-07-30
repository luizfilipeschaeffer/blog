import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { PostEditor } from "@/components/admin/post-editor";
import { getPostAdmin } from "@/lib/blog/services";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories, authors] = await Promise.all([
    getPostAdmin(id),
    prisma.blogCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.blogAuthor.findMany({ orderBy: { displayName: "asc" } }),
  ]);

  if (!post) notFound();

  const primary = post.authors.find((a) => a.role === "author");
  const coauthors = post.authors
    .filter((a) => a.role === "coauthor")
    .map((a) => a.userId);

  return (
    <AdminShell>
      <PostEditor
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          body: post.body,
          coverUrl: post.coverUrl,
          status: post.status,
          featured: post.featured,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          categoryId: post.categoryId,
          scheduledFor: post.scheduledFor?.toISOString().slice(0, 16) || "",
          authorId: primary?.userId || "",
          coauthorIds: coauthors,
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        authors={authors.map((a) => ({
          id: a.id,
          displayName: a.displayName,
          handle: a.handle,
          avatarUrl: a.avatarUrl,
        }))}
      />
    </AdminShell>
  );
}
