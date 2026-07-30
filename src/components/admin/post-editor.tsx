"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/blog/utils";

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  published: "Publicado",
};

type EditorPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverUrl: string;
  status: string;
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
  categoryId: string | null;
  scheduledFor: string;
  authorId: string;
  coauthorIds: string[];
};

type Option = { id: string; name: string };
type AuthorOption = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
};

export function PostEditor({
  post: initial,
  categories,
  authors,
}: {
  post: EditorPost;
  categories: Option[];
  authors: AuthorOption[];
}) {
  const router = useRouter();
  const [post, setPost] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);

  function patch<K extends keyof EditorPost>(key: K, value: EditorPost[K]) {
    setPost((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          title: post.title,
          slug: post.slug || slugify(post.title),
          excerpt: post.excerpt,
          body: post.body,
          coverUrl: post.coverUrl,
          status: post.status,
          featured: post.featured,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          categoryId: post.categoryId || null,
          scheduledFor: post.scheduledFor || null,
          authorId: post.authorId || null,
          coauthorIds: post.coauthorIds,
        }),
      });
      if (!res.ok) {
        toast.error("Erro ao salvar");
        return;
      }
      const updated = await res.json();
      setPost((prev) => ({
        ...prev,
        slug: updated.slug,
        status: updated.status,
        scheduledFor: updated.scheduledFor
          ? new Date(updated.scheduledFor).toISOString().slice(0, 16)
          : "",
      }));
      toast.success("Salvo");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const res = await fetch(`/api/admin/posts?id=${post.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Erro ao excluir");
      return;
    }
    toast.success("Artigo excluído");
    router.push("/admin/blog");
  }

  function toggleCoauthor(id: string, checked: boolean) {
    setPost((prev) => ({
      ...prev,
      coauthorIds: checked
        ? [...prev.coauthorIds, id]
        : prev.coauthorIds.filter((x) => x !== id),
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Editar</h1>
            <Badge variant={post.status === "published" ? "default" : "secondary"}>
              {STATUS_LABELS[post.status] || post.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">/{post.slug || "…"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/blog/${post.slug}?preview=1`} target="_blank">
              <ExternalLink className="size-4" />
              Preview
            </Link>
          </Button>
          <Button onClick={save} disabled={saving}>
            <Save className="size-4" />
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={post.title}
              onChange={(e) => {
                const title = e.target.value;
                setPost((prev) => ({
                  ...prev,
                  title,
                  slug: prev.slug ? prev.slug : slugify(title),
                }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={post.excerpt}
              onChange={(e) => patch("excerpt", e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Corpo (Markdown)</Label>
            <Textarea
              id="body"
              value={post.body}
              onChange={(e) => patch("body", e.target.value)}
              rows={22}
              className="font-mono text-sm"
            />
          </div>

          <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" type="button">
                SEO {seoOpen ? "▾" : "▸"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3 rounded-lg border p-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta title</Label>
                <Input
                  id="metaTitle"
                  value={post.metaTitle}
                  onChange={(e) => patch("metaTitle", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta description</Label>
                <Textarea
                  id="metaDescription"
                  value={post.metaDescription}
                  onChange={(e) => patch("metaDescription", e.target.value)}
                  rows={3}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <aside className="space-y-4 rounded-lg border p-4 h-fit">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={post.slug}
              onChange={(e) => patch("slug", slugify(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={post.status}
              onValueChange={(v) => patch("status", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {post.status === "scheduled" ? (
            <div className="space-y-2">
              <Label htmlFor="scheduledFor">Agendar para</Label>
              <Input
                id="scheduledFor"
                type="datetime-local"
                value={post.scheduledFor}
                onChange={(e) => patch("scheduledFor", e.target.value)}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={post.categoryId || "none"}
              onValueChange={(v) =>
                patch("categoryId", v === "none" ? null : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverUrl">Capa (URL)</Label>
            <Input
              id="coverUrl"
              value={post.coverUrl}
              onChange={(e) => patch("coverUrl", e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="featured">Destaque</Label>
            <Switch
              id="featured"
              checked={post.featured}
              onCheckedChange={(v) => patch("featured", v)}
            />
          </div>

          <div className="space-y-2">
            <Label>Autor</Label>
            <Select
              value={post.authorId || "none"}
              onValueChange={(v) =>
                patch("authorId", v === "none" ? "" : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Autor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem autor</SelectItem>
                {authors.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.displayName} (@{a.handle})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {post.authorId ? (
              <div className="flex items-center gap-2 pt-1">
                {(() => {
                  const a = authors.find((x) => x.id === post.authorId);
                  if (!a) return null;
                  return (
                    <>
                      <Avatar className="size-8">
                        {a.avatarUrl ? <AvatarImage src={a.avatarUrl} /> : null}
                        <AvatarFallback>
                          {a.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">@{a.handle}</span>
                    </>
                  );
                })()}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Coautores</Label>
            <div className="space-y-2">
              {authors
                .filter((a) => a.id !== post.authorId)
                .map((a) => (
                  <label
                    key={a.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={post.coauthorIds.includes(a.id)}
                      onCheckedChange={(v) =>
                        toggleCoauthor(a.id, Boolean(v))
                      }
                    />
                    {a.displayName}
                  </label>
                ))}
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="size-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir artigo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={remove}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </aside>
      </div>
    </div>
  );
}
