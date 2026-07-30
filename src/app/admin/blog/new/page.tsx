import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { NewPostActions } from "@/components/admin/new-post-actions";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const templates = await prisma.blogTemplate.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Novo artigo</h1>
        <p className="text-sm text-muted-foreground">
          Comece em branco ou aplique um template.
        </p>
      </div>

      <div className="mb-8">
        <NewPostActions />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="flex flex-col gap-3 rounded-lg border p-4"
          >
            <div>
              <h2 className="font-medium">{tpl.name}</h2>
              <p className="text-sm text-muted-foreground">
                {tpl.description || tpl.category?.name || "Template"}
              </p>
            </div>
            <NewPostActions templateId={tpl.id} label={`Usar ${tpl.name}`} />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Button variant="outline" asChild>
          <Link href="/admin/blog">Voltar</Link>
        </Button>
      </div>
    </AdminShell>
  );
}
