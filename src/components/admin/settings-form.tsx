"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

type Settings = {
  publisherName: string;
  defaultAuthorName: string;
  defaultAuthorUserId: string | null;
  defaultOgImageUrl: string;
  syndicationFooter: string;
  publicBaseUrl: string;
};

export function SettingsForm({
  settings: initial,
  authors,
}: {
  settings: Settings;
  authors: { id: string; displayName: string; handle: string }[];
}) {
  const [settings, setSettings] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        toast.error("Erro ao salvar");
        return;
      }
      toast.success("Settings salvas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="publisherName">Publisher</Label>
        <Input
          id="publisherName"
          value={settings.publisherName}
          onChange={(e) =>
            setSettings((s) => ({ ...s, publisherName: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="defaultAuthorName">Autor padrão (nome)</Label>
        <Input
          id="defaultAuthorName"
          value={settings.defaultAuthorName}
          onChange={(e) =>
            setSettings((s) => ({ ...s, defaultAuthorName: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Autor padrão (perfil)</Label>
        <Select
          value={settings.defaultAuthorUserId || "none"}
          onValueChange={(v) =>
            setSettings((s) => ({
              ...s,
              defaultAuthorUserId: v === "none" ? null : v,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            {authors.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.displayName} (@{a.handle})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="publicBaseUrl">URL pública</Label>
        <Input
          id="publicBaseUrl"
          placeholder="http://localhost:3000"
          value={settings.publicBaseUrl}
          onChange={(e) =>
            setSettings((s) => ({ ...s, publicBaseUrl: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="defaultOgImageUrl">OG image padrão (URL)</Label>
        <Input
          id="defaultOgImageUrl"
          value={settings.defaultOgImageUrl}
          onChange={(e) =>
            setSettings((s) => ({ ...s, defaultOgImageUrl: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="syndicationFooter">Syndication footer (HTML)</Label>
        <Textarea
          id="syndicationFooter"
          rows={5}
          className="font-mono text-sm"
          value={settings.syndicationFooter}
          onChange={(e) =>
            setSettings((s) => ({ ...s, syndicationFooter: e.target.value }))
          }
        />
      </div>
      <Button onClick={save} disabled={loading}>
        {loading ? "Salvando…" : "Salvar settings"}
      </Button>
    </div>
  );
}
