import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/blog/services";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, authors] = await Promise.all([
    getSettings(),
    prisma.blogAuthor.findMany({ orderBy: { displayName: "asc" } }),
  ]);

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Publisher, URL pública e rodapé de syndicacão.
        </p>
      </div>
      <SettingsForm
        settings={{
          publisherName: settings.publisherName,
          defaultAuthorName: settings.defaultAuthorName,
          defaultAuthorUserId: settings.defaultAuthorUserId,
          defaultOgImageUrl: settings.defaultOgImageUrl,
          syndicationFooter: settings.syndicationFooter,
          publicBaseUrl: settings.publicBaseUrl,
        }}
        authors={authors.map((a) => ({
          id: a.id,
          displayName: a.displayName,
          handle: a.handle,
        }))}
      />
    </AdminShell>
  );
}
