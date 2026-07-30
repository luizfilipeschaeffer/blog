import { BLOG_CSP } from "@/lib/blog/utils";

export function htmlResponse(html: string, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("Content-Security-Policy", BLOG_CSP);
  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", "public, max-age=60");
  }
  return new Response(html, { ...init, headers });
}
