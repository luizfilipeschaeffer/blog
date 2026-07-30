"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await fetch("/api/admin/auth", { method: "DELETE" });
        toast.success("Sessão encerrada");
        router.push("/admin/login");
        router.refresh();
      }}
    >
      <LogOut className="size-3.5" />
      Sair
    </Button>
  );
}
