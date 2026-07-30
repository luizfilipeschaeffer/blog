import { AdminShell } from "@/components/admin/admin-shell";
import { TemplatesManager } from "@/components/admin/templates-manager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const [templates, categories] = await Promise.all([
    prisma.blogTemplate.findMany({
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.blogCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground">
          Skeletons Markdown para acelerar novos posts.
        </p>
      </div>
      <TemplatesManager
        initial={templates.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          description: t.description,
          categoryId: t.categoryId,
          titlePrefix: t.titlePrefix,
          excerptHint: t.excerptHint,
          bodySkeleton: t.bodySkeleton,
          metaTitlePattern: t.metaTitlePattern,
          metaDescriptionHint: t.metaDescriptionHint,
          defaultCoverUrl: t.defaultCoverUrl,
          sortOrder: t.sortOrder,
          active: t.active,
        }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </AdminShell>
  );
}
