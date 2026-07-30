import { BLOG_CSS } from "@/lib/blog/render/css";
import {
  renderGradualBlur,
  renderThemeSwitch,
  THEME_BOOT_SCRIPT,
  THEME_UI_SCRIPT,
} from "@/lib/blog/render/features";
import { absoluteUrl, escapeHtml, publicBaseUrl } from "@/lib/blog/utils";

export type LayoutCategory = { name: string; slug: string };

export type LayoutOptions = {
  title: string;
  description?: string;
  canonicalPath: string;
  publisherName: string;
  settings?: { publicBaseUrl?: string | null; defaultOgImageUrl?: string | null };
  ogType?: "website" | "article";
  ogImage?: string;
  robots?: string;
  jsonLd?: Record<string, unknown> | null;
  bodyHtml: string;
  previewBanner?: string;
  hideBottomBlur?: boolean;
  extraHead?: string;
  categories?: LayoutCategory[];
  activeCategory?: string | null;
  articleMeta?: {
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    authors?: string[];
  };
  pageScripts?: string;
};

function renderHeaderTopics(
  categories: LayoutCategory[] = [],
  activeCategory?: string | null,
) {
  if (!categories.length) return "";

  const links = [
    `<a class="topic-link${!activeCategory ? " is-active" : ""}" href="/blog">Todos</a>`,
    ...categories.map(
      (c) =>
        `<a class="topic-link${activeCategory === c.slug ? " is-active" : ""}" href="/blog?category=${encodeURIComponent(c.slug)}">${escapeHtml(c.name)}</a>`,
    ),
  ].join("");

  return `<nav class="topics-nav" aria-label="Tópicos">${links}</nav>`;
}

export function renderLayout(opts: LayoutOptions): string {
  const base = publicBaseUrl(opts.settings);
  const canonical = absoluteUrl(opts.canonicalPath, opts.settings);
  const description = escapeHtml(opts.description || opts.title);
  const title = escapeHtml(opts.title);
  const publisher = escapeHtml(opts.publisherName);
  const ogImage = opts.ogImage
    ? absoluteUrl(opts.ogImage, opts.settings)
    : opts.settings?.defaultOgImageUrl
      ? absoluteUrl(opts.settings.defaultOgImageUrl, opts.settings)
      : "";

  const jsonLd = opts.jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(opts.jsonLd).replace(/</g, "\\u003c")}</script>`
    : "";

  const articleTags = opts.articleMeta
    ? [
        opts.articleMeta.publishedTime
          ? `<meta property="article:published_time" content="${escapeHtml(opts.articleMeta.publishedTime)}" />`
          : "",
        opts.articleMeta.modifiedTime
          ? `<meta property="article:modified_time" content="${escapeHtml(opts.articleMeta.modifiedTime)}" />`
          : "",
        opts.articleMeta.section
          ? `<meta property="article:section" content="${escapeHtml(opts.articleMeta.section)}" />`
          : "",
        ...(opts.articleMeta.authors || []).map(
          (a) => `<meta property="article:author" content="${escapeHtml(a)}" />`,
        ),
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <script>${THEME_BOOT_SCRIPT}</script>
  <title>${title}</title>
  <meta name="description" content="${description}" />
  ${opts.robots ? `<meta name="robots" content="${escapeHtml(opts.robots)}" />` : ""}
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <link rel="alternate" type="application/rss+xml" title="${publisher} RSS" href="${escapeHtml(`${base}/feed.xml`)}" />
  <link rel="alternate" type="application/feed+json" title="${publisher} JSON Feed" href="${escapeHtml(`${base}/feed.json`)}" />
  <meta property="og:site_name" content="${publisher}" />
  <meta property="og:type" content="${opts.ogType || "website"}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ""}
  ${articleTags}
  <meta name="twitter:card" content="${ogImage ? "summary_large_image" : "summary"}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : ""}
  <style>${BLOG_CSS}</style>
  ${opts.extraHead || ""}
  ${jsonLd}
</head>
<body>
  ${opts.previewBanner || ""}
  <header class="site-header">
    <div class="inner">
      <a class="brand" href="/blog">${publisher}</a>
      ${renderHeaderTopics(opts.categories, opts.activeCategory)}
      <div class="nav-actions">
        ${renderThemeSwitch()}
      </div>
    </div>
  </header>
  <main>${opts.bodyHtml}</main>
  <footer class="site-footer">
    <div class="inner">
      <span>
        © ${new Date().getFullYear()} ${publisher}
        · Criado por <a href="https://luizfilipeschaeffer.dev" target="_blank" rel="noopener noreferrer">luizfilipeschaeffer.dev</a>
      </span>
      <span>
        <a href="/blog">Blog</a> ·
        <a href="/feed.xml">RSS</a> ·
        <a href="/feed.json">JSON Feed</a> ·
        <a href="/sitemap-blog.xml">Sitemap</a> ·
        <a href="/admin/blog">Admin</a>
      </span>
    </div>
  </footer>
  ${renderGradualBlur({ position: "top", height: "5rem" })}
  ${opts.hideBottomBlur ? "" : renderGradualBlur({ position: "bottom", height: "6rem" })}
  <script>${THEME_UI_SCRIPT}</script>
  ${opts.pageScripts || ""}
</body>
</html>`;
}

export function renderAuthorAvatars(
  authors: { name: string; avatar_url?: string }[],
  max = 2,
): string {
  return `<span class="author-avatars">${authors
    .slice(0, max)
    .map((a) => {
      const label = escapeHtml(a.name || "?");
      if (a.avatar_url) {
        return `<img src="${escapeHtml(a.avatar_url)}" alt="${label}" />`;
      }
      const initials = String(a.name || "?")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() || "")
        .join("");
      return `<span aria-hidden="true">${escapeHtml(initials || "?")}</span>`;
    })
    .join("")}</span>`;
}
