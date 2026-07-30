import {
  buildArticleOutline,
  COPY_SCRIPT,
} from "@/lib/blog/render/features";
import { renderLayout, renderAuthorAvatars } from "@/lib/blog/render/layout";
import {
  absoluteUrl,
  escapeHtml,
  formatAuthorsLine,
  formatDatePtBr,
  markdownToHtml,
  publicBaseUrl,
  resolvePostCover,
  type PublicPost,
} from "@/lib/blog/utils";

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  published: "Publicado",
};

export function renderBlogPost({
  post,
  settings,
  categories = [],
  preview = false,
  views,
}: {
  post: PublicPost;
  settings: {
    publisherName: string;
    publicBaseUrl?: string | null;
    defaultOgImageUrl?: string | null;
    defaultAuthorName?: string;
    syndicationFooter?: string | null;
  };
  categories?: { name: string; slug: string }[];
  preview?: boolean;
  views?: number;
}) {
  const publisher = settings.publisherName || "SSR Blog Kit";
  const base = publicBaseUrl(settings);
  const url = absoluteUrl(`/blog/${post.slug}`, settings);
  const cover = resolvePostCover(post, settings);
  const rawHtml = markdownToHtml(post.body);
  const { content, headings } = buildArticleOutline(rawHtml);
  const authorsLine = formatAuthorsLine(post, settings);
  const pageTitle = `${preview ? "[Preview] " : ""}${post.meta_title || post.title} · ${publisher}`;
  const description =
    post.meta_description || post.excerpt || post.title;

  const toc =
    headings.length > 0
      ? `<nav class="article-toc" aria-label="Sumário">
          <h2>Sumário</h2>
          ${headings
            .map(
              (h) =>
                `<a class="level-${h.level}" href="#${escapeHtml(h.id)}">${escapeHtml(h.text)}</a>`,
            )
            .join("")}
        </nav>`
      : "";

  const share = `<aside class="share-tools" aria-label="Compartilhar">
    <span class="share-label">Compartilhar</span>
    <a class="share-bubble" href="https://wa.me/?text=${encodeURIComponent(`${post.title} ${url}`)}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
      <img src="https://cdn.simpleicons.org/whatsapp/171717" alt="" />
    </a>
    <a class="share-bubble" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
      <span class="li">in</span>
    </a>
    <a class="share-bubble" href="https://x.com/intent/post?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer" aria-label="X">
      <img src="https://cdn.simpleicons.org/x/171717" alt="" />
    </a>
    <a class="share-bubble" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
      <img src="https://cdn.simpleicons.org/facebook/171717" alt="" />
    </a>
    <button type="button" class="share-bubble" data-copy-url="${escapeHtml(url)}" aria-label="Copiar link">
      <img src="https://cdn.simpleicons.org/linktree/171717" alt="" />
    </button>
    <div class="copy-feedback" data-copy-feedback aria-live="polite"></div>
  </aside>`;

  const viewsHtml =
    !preview && views && views > 0
      ? `<span>${views.toLocaleString("pt-BR")} visualizaç${views === 1 ? "ão" : "ões"}</span>`
      : "";

  const authorFooter = post.authors.length
    ? `<div class="author-footer">
        ${post.authors
          .map(
            (a) => `<div class="author-footer-item">
              ${renderAuthorAvatars([{ name: a.name, avatar_url: a.avatar_url }], 1)}
              <div class="author-footer-meta">
                <div><strong>${escapeHtml(a.name)}</strong></div>
                <div class="role">@${escapeHtml(a.handle.replace(/^@+/, ""))} · ${a.role === "author" ? "Autor" : "Coautor"}</div>
              </div>
            </div>`,
          )
          .join("")}
      </div>`
    : "";

  const syndication = settings.syndicationFooter
    ? `<aside class="syndication-footer">${settings.syndicationFooter}</aside>`
    : "";

  const bodyHtml = `
    ${cover ? `<div class="article-cover-shell"><img class="article-cover" src="${escapeHtml(cover)}" alt="" fetchpriority="high" /></div>` : ""}
    <div class="article-page">
      <div class="article-layout${headings.length ? "" : " no-toc"}">
        ${toc}
        <article class="article-card">
          <header class="article-header">
            <div class="meta">
              ${post.category_name ? `<span class="badge">${escapeHtml(post.category_name)}</span>` : ""}
              ${post.featured ? `<span class="badge">Destaque</span>` : ""}
              ${post.published_at ? `<time datetime="${post.published_at.toISOString()}">${escapeHtml(formatDatePtBr(post.published_at))}</time>` : ""}
              ${viewsHtml}
            </div>
            <h1>${escapeHtml(post.title)}</h1>
            ${post.excerpt ? `<p class="lead">${escapeHtml(post.excerpt)}</p>` : ""}
            <div class="byline">
              ${renderAuthorAvatars(post.authors.map((a) => ({ name: a.name, avatar_url: a.avatar_url })), 3)}
              <div class="byline-text">
                <div>${escapeHtml(post.authors.map((a) => a.name).join(", ") || settings.defaultAuthorName || publisher)}</div>
                <div>${escapeHtml(authorsLine)}</div>
              </div>
            </div>
          </header>
          <div class="prose">${content}</div>
          ${authorFooter}
          ${syndication}
        </article>
        ${share}
      </div>
    </div>
    <div class="reading-progress" aria-hidden="true"><span></span></div>
  `;

  const previewBanner = preview
    ? `<div class="preview-banner">Pré-visualização · ${STATUS_LABEL[post.status] || post.status}. Não indexado</div>`
    : "";

  const schemaType =
    post.category_slug === "noticias" ? "NewsArticle" : "Article";

  const jsonLd = preview
    ? null
    : {
        "@context": "https://schema.org",
        "@type": schemaType,
        headline: post.title,
        description,
        image: cover ? [absoluteUrl(cover, settings)] : undefined,
        datePublished: post.published_at?.toISOString(),
        dateModified: post.updated_at.toISOString(),
        author: post.authors.map((a) => ({
          "@type": "Person",
          name: a.name,
          alternateName: a.handle ? `@${a.handle.replace(/^@+/, "")}` : undefined,
          image: a.avatar_url || undefined,
        })),
        publisher: {
          "@type": "Organization",
          name: publisher,
          url: base,
          ...(settings.defaultOgImageUrl
            ? {
                logo: {
                  "@type": "ImageObject",
                  url: absoluteUrl(settings.defaultOgImageUrl, settings),
                },
              }
            : {}),
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        articleSection: post.category_name || undefined,
        url,
      };

  return renderLayout({
    title: pageTitle,
    description,
    canonicalPath: `/blog/${post.slug}`,
    publisherName: publisher,
    settings,
    categories,
    activeCategory: post.category_slug,
    ogType: "article",
    ogImage: cover || undefined,
    robots: preview ? "noindex, nofollow" : undefined,
    jsonLd,
    previewBanner,
    hideBottomBlur: true,
    articleMeta: {
      publishedTime: post.published_at?.toISOString(),
      modifiedTime: post.updated_at.toISOString(),
      section: post.category_name || undefined,
      authors: post.authors.map((a) => a.name),
    },
    bodyHtml,
    pageScripts: `<script>${COPY_SCRIPT}</script>`,
  });
}
