import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

export function slugify(input: string): string {
  return String(input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function markdownToHtml(md: string): string {
  return marked.parse(String(md || ""), { async: false }) as string;
}

export function publicBaseUrl(settings?: { publicBaseUrl?: string | null } | null): string {
  const fromSettings = String(settings?.publicBaseUrl || "")
    .trim()
    .replace(/\/$/, "");
  if (fromSettings) return fromSettings;
  return String(process.env.PUBLIC_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function absoluteUrl(
  path: string,
  settings?: { publicBaseUrl?: string | null } | null,
): string {
  const base = publicBaseUrl(settings);
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatDatePtBr(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(d);
}

export function initials(name: string): string {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export function decodeHeadingText(inner: string): string {
  return String(inner || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export type PublicAuthor = {
  user_id: string;
  role: "author" | "coauthor";
  handle: string;
  name: string;
  avatar_url: string;
  sort_order: number;
};

export type PublicPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_url: string;
  status: string;
  featured: boolean;
  meta_title: string;
  meta_description: string;
  published_at: Date | null;
  updated_at: Date;
  view_count: number;
  category_name: string | null;
  category_slug: string | null;
  category_default_cover_url: string;
  authors: PublicAuthor[];
  author_name: string;
  author_handle: string;
  author_avatar_url: string;
  coauthors: PublicAuthor[];
};

export function resolvePostCover(
  post: {
    cover_url?: string | null;
    category_default_cover_url?: string | null;
  },
  settings?: { defaultOgImageUrl?: string | null } | null,
): string {
  const custom = String(post?.cover_url || "").trim();
  if (custom) return custom;
  const categoryDefault = String(post?.category_default_cover_url || "").trim();
  if (categoryDefault) return categoryDefault;
  return String(settings?.defaultOgImageUrl || "").trim();
}

export function formatAuthorsLine(
  post: { authors?: PublicAuthor[]; author_name?: string },
  settings?: { defaultAuthorName?: string; publisherName?: string } | null,
): string {
  const handles = (post.authors || [])
    .map((a) => a.handle)
    .filter(Boolean)
    .map((h) => `@${h.replace(/^@+/, "")}`);
  if (handles.length === 1) return `Por ${handles[0]}`;
  if (handles.length === 2) return `Por ${handles[0]} e ${handles[1]}`;
  if (handles.length > 2) {
    return `Por ${handles.slice(0, -1).join(", ")} e ${handles.at(-1)}`;
  }
  return `Por ${
    post.author_name ||
    settings?.defaultAuthorName ||
    settings?.publisherName ||
    "Luiz Filipe Schaeffer"
  }`;
}

export function applyTemplateFields(
  template: {
    id: string;
    categoryId?: string | null;
    titlePrefix?: string | null;
    excerptHint?: string | null;
    bodySkeleton?: string | null;
    metaTitlePattern?: string | null;
    metaDescriptionHint?: string | null;
    defaultCoverUrl?: string | null;
  },
  overrides: Record<string, string | null | undefined> = {},
) {
  const title =
    overrides.title ?? String(template.titlePrefix || "").trim();
  const meta_title =
    overrides.meta_title ??
    (template.metaTitlePattern
      ? String(template.metaTitlePattern).replace("%s", title || "Artigo")
      : "");
  return {
    category_id: overrides.category_id ?? template.categoryId ?? null,
    template_id: template.id,
    title: title || overrides.title || "",
    excerpt: overrides.excerpt ?? template.excerptHint ?? "",
    body: overrides.body ?? template.bodySkeleton ?? "",
    cover_url: overrides.cover_url ?? template.defaultCoverUrl ?? "",
    meta_title,
    meta_description:
      overrides.meta_description ?? template.metaDescriptionHint ?? "",
  };
}

export function isPreviewQuery(value: string | null | undefined): boolean {
  const v = String(value || "").toLowerCase();
  return v === "1" || v === "true" || v === "preview";
}

export const BLOG_CSP = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "script-src 'unsafe-inline'",
  "font-src 'self' data:",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");
