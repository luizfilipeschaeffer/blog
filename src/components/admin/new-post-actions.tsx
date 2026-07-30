"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function NewPostActions({
  templateId,
  label = "Artigo em branco",
}: {
  templateId?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          templateId
            ? { fromTemplate: true, templateId }
            : { title: "Novo artigo", status: "draft", body: "## Introdução\n\n" },
        ),
      });
      if (!res.ok) {
        toast.error("Não foi possível criar o artigo");
        return;
      }
      const post = await res.json();
      toast.success("Artigo criado");
      router.push(`/admin/blog/${post.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={create} disabled={loading} variant={templateId ? "secondary" : "default"}>
      {loading ? "Criando…" : label}
    </Button>
  );
}
