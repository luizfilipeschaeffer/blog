"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { slugify } from "@/lib/blog/utils";

type Cat = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  published: boolean;
  defaultCoverUrl: string;
};

export function CategoriesManager({ initial }: { initial: Cat[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sortOrder: 0,
    published: true,
    defaultCoverUrl: "",
  });

  async function create() {
    const res = await fetch("/api/admin/categories", {
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
    setForm({
      name: "",
      slug: "",
      sortOrder: 0,
      published: true,
      defaultCoverUrl: "",
    });
    toast.success("Categoria criada");
    router.refresh();
  }

  async function save(cat: Cat) {
    const res = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cat),
    });
    if (!res.ok) {
      toast.error("Erro ao salvar");
      return;
    }
    toast.success("Salva");
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/categories?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Erro ao excluir");
      return;
    }
    setItems((prev) => prev.filter((c) => c.id !== id));
    toast.success("Excluída");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
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
        <div className="space-y-2">
          <Label>Ordem</Label>
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) =>
              setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Capa padrão (URL)</Label>
          <Input
            value={form.defaultCoverUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, defaultCoverUrl: e.target.value }))
            }
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={form.published}
            onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
          />
          <Label>Publicada</Label>
        </div>
        <div className="flex items-end">
          <Button onClick={create}>Adicionar</Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Publicada</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>
                  <Input
                    value={cat.name}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((c) =>
                          c.id === cat.id ? { ...c, name: e.target.value } : c,
                        ),
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={cat.slug}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((c) =>
                          c.id === cat.id
                            ? { ...c, slug: slugify(e.target.value) }
                            : c,
                        ),
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={cat.sortOrder}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((c) =>
                          c.id === cat.id
                            ? { ...c, sortOrder: Number(e.target.value) }
                            : c,
                        ),
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={cat.published}
                    onCheckedChange={(v) =>
                      setItems((prev) =>
                        prev.map((c) =>
                          c.id === cat.id ? { ...c, published: v } : c,
                        ),
                      )
                    }
                  />
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button size="sm" variant="secondary" onClick={() => save(cat)}>
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => remove(cat.id)}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
