"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
  createdAt: string;
};

export function UsersManager({
  initial,
  currentUserId,
}: {
  initial: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initial);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "editor" as "admin" | "editor",
    sendInvite: true,
  });
  const [loading, setLoading] = useState(false);

  async function createUser() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Erro ao criar");
        return;
      }
      setUsers((prev) => [...prev, data]);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "editor",
        sendInvite: true,
      });
      toast.success(
        form.sendInvite
          ? "Usuário criado e convite enviado"
          : "Usuário criado",
      );
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(id: string, role: "admin" | "editor") {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error || "Erro ao atualizar");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success("Papel atualizado");
    router.refresh();
  }

  async function removeUser(id: string) {
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error || "Erro ao excluir");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("Usuário excluído");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>E-mail</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Papel</Label>
          <Select
            value={form.role}
            onValueChange={(v) =>
              setForm((f) => ({
                ...f,
                role: v === "admin" ? "admin" : "editor",
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Senha temporária (opcional)</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            disabled={form.sendInvite}
            placeholder={form.sendInvite ? "Usará link por e-mail" : ""}
          />
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <Checkbox
            checked={form.sendInvite}
            onCheckedChange={(v) =>
              setForm((f) => ({ ...f, sendInvite: Boolean(v) }))
            }
          />
          Enviar e-mail de convite / definição de senha
        </label>
        <div>
          <Button onClick={createUser} disabled={loading}>
            {loading ? "Criando…" : "Adicionar usuário"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.name}</div>
                  {user.id === currentUserId ? (
                    <div className="text-xs text-muted-foreground">você</div>
                  ) : null}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role === "admin" ? "Admin" : "Editor"}
                    </Badge>
                    <Select
                      value={user.role}
                      onValueChange={(v) =>
                        updateRole(user.id, v === "admin" ? "admin" : "editor")
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={user.id === currentUserId}
                    onClick={() => removeUser(user.id)}
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
