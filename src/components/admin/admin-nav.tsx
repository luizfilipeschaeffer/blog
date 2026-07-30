"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const baseLinks = [
  { href: "/admin/blog", label: "Artigos" },
  { href: "/admin/blog/new", label: "Novo" },
  { href: "/admin/blog/templates", label: "Templates" },
  { href: "/admin/blog/categories", label: "Categorias" },
  { href: "/admin/blog/settings", label: "Settings" },
];

export function AdminNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const links = isAdmin
    ? [...baseLinks, { href: "/admin/blog/users", label: "Usuários" }]
    : baseLinks;

  return (
    <nav className="flex flex-wrap gap-1">
      {links.map((link) => {
        const active =
          link.href === "/admin/blog"
            ? pathname === "/admin/blog"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
