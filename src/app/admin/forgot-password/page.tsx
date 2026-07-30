"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Não foi possível enviar");
        return;
      }
      setSent(true);
      toast.success(data.message || "Verifique seu e-mail");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        Recuperar senha
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Informe o e-mail da conta. Se existir, enviaremos um link de
        redefinição.
      </p>
      {sent ? (
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Se o e-mail estiver cadastrado, o link já foi enviado. Confira também
            a pasta de spam.
          </p>
          <Button asChild variant="outline">
            <Link href="/admin/login">Voltar ao login</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando…" : "Enviar link"}
          </Button>
          <p className="text-center text-sm">
            <Link
              href="/admin/login"
              className="text-muted-foreground underline underline-offset-4"
            >
              Voltar ao login
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
