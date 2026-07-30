"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  published: "Publicado",
};

type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  categoryName: string | null;
  updatedAt: string;
  publishedAt: string | null;
};

export function PostsTable({
  posts,
  initialStatus,
  initialQuery,
}: {
  posts: PostRow[];
  initialStatus: string;
  initialQuery: string;
}) {
  const router = useRouter();

  function updateParams(next: { status?: string; q?: string }) {
    const params = new URLSearchParams();
    const status = next.status ?? initialStatus;
    const q = next.q ?? initialQuery;
    if (status && status !== "all") params.set("status", status);
    if (q) params.set("q", q);
    const qs = params.toString();
    router.push(qs ? `/admin/blog?${qs}` : "/admin/blog");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar título ou slug…"
          defaultValue={initialQuery}
          className="max-w-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams({ q: (e.target as HTMLInputElement).value });
            }
          }}
        />
        <Select
          defaultValue={initialStatus}
          onValueChange={(status) => updateParams({ status })}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="scheduled">Agendado</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum artigo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="font-medium">{post.title}</div>
                    <div className="text-xs text-muted-foreground">/{post.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        post.status === "published" ? "default" : "secondary"
                      }
                    >
                      {STATUS_LABELS[post.status] || post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.categoryName || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(post.updatedAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/blog/${post.id}`}>
                          <Pencil className="size-3.5" />
                          Editar
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/blog/${post.slug}?preview=1`}
                          target="_blank"
                        >
                          <ExternalLink className="size-3.5" />
                          Preview
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
