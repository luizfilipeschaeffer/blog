"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

type Tpl = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string | null;
  titlePrefix: string;
  excerptHint: string;
  bodySkeleton: string;
  metaTitlePattern: string;
  metaDescriptionHint: string;
  defaultCoverUrl: string;
  sortOrder: number;
  active: boolean;
};

const empty: Omit<Tpl, "id"> = {
  name: "",
  slug: "",
  description: "",
  categoryId: null,
  titlePrefix: "",
  excerptHint: "",
  bodySkeleton: "## Introdução\n\n",
  metaTitlePattern: "%s | Blog",
  metaDescriptionHint: "",
  defaultCoverUrl: "",
  sortOrder: 0,
  active: true,
};

export function TemplatesManager({
  initial,
  categories,
}: {
  initial: Tpl[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);

  async function create() {
    const res = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      toast.error("Erro ao criar");
      return;
    }
    const created = await res.json();
    setItems((prev) => [...prev, created]);
    setForm(empty);
    toast.success("Template criado");
    router.refresh();
  }

  async function save(tpl: Tpl) {
    const res = await fetch("/api/admin/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tpl),
    });
    if (!res.ok) {
      toast.error("Erro ao salvar");
      return;
    }
    toast.success("Salvo");
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/templates?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Erro ao excluir");
      return;
    }
    setItems((prev) => prev.filter((t) => t.id !== id));
    toast.success("Excluído");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-3 rounded-lg border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                  slug: f.slug || slugify(e.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: slugify(e.target.value) }))
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Descrição</Label>
          <Input
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Body skeleton</Label>
          <Textarea
            className="font-mono text-sm"
            rows={6}
            value={form.bodySkeleton}
            onChange={(e) =>
              setForm((f) => ({ ...f, bodySkeleton: e.target.value }))
            }
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={form.active}
            onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
          />
          <Label>Ativo</Label>
        </div>
        <Button onClick={create} className="w-fit">
          Adicionar template
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((tpl) => {
          const open = editing === tpl.id;
          return (
            <div key={tpl.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{tpl.name}</div>
                  <div className="text-sm text-muted-foreground">
                    /{tpl.slug}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditing(open ? null : tpl.id)}
                  >
                    {open ? "Fechar" : "Editar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => remove(tpl.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
              {open ? (
                <div className="mt-4 grid gap-3">
                  <Input
                    value={tpl.name}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((t) =>
                          t.id === tpl.id ? { ...t, name: e.target.value } : t,
                        ),
                      )
                    }
                  />
                  <Select
                    value={tpl.categoryId || "none"}
                    onValueChange={(v) =>
                      setItems((prev) =>
                        prev.map((t) =>
                          t.id === tpl.id
                            ? { ...t, categoryId: v === "none" ? null : v }
                            : t,
                        ),
                      )
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
                  <Textarea
                    className="font-mono text-sm"
                    rows={8}
                    value={tpl.bodySkeleton}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((t) =>
                          t.id === tpl.id
                            ? { ...t, bodySkeleton: e.target.value }
                            : t,
                        ),
                      )
                    }
                  />
                  <Input
                    placeholder="Meta title pattern (%s)"
                    value={tpl.metaTitlePattern}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((t) =>
                          t.id === tpl.id
                            ? { ...t, metaTitlePattern: e.target.value }
                            : t,
                        ),
                      )
                    }
                  />
                  <Button onClick={() => save(tpl)} className="w-fit">
                    Salvar template
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
