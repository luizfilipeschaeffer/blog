import { renderLayout, renderAuthorAvatars } from "@/lib/blog/render/layout";
import {
  escapeHtml,
  formatAuthorsLine,
  formatDatePtBr,
  publicBaseUrl,
  resolvePostCover,
  type PublicPost,
} from "@/lib/blog/utils";

type Category = { name: string; slug: string };

function renderPostCard(
  post: PublicPost,
  settings: {
    defaultOgImageUrl?: string | null;
    defaultAuthorName?: string;
    publisherName: string;
  },
  className = "",
) {
  const cover = resolvePostCover(post, settings);
  const authorsLine = formatAuthorsLine(post, settings);

  return `<a class="card${cover ? " has-cover" : ""}${className ? ` ${className}` : ""}" href="/blog/${escapeHtml(post.slug)}">
    ${cover ? `<img class="card-cover" src="${escapeHtml(cover)}" alt="" loading="lazy" />` : ""}
    <div class="card-body">
      <div class="meta">
        ${post.category_name ? `<span class="badge">${escapeHtml(post.category_name)}</span>` : ""}
        ${post.featured ? `<span class="badge">Destaque</span>` : ""}
        ${post.published_at ? `<time datetime="${post.published_at.toISOString()}">${escapeHtml(formatDatePtBr(post.published_at))}</time>` : ""}
      </div>
      <h2>${escapeHtml(post.title)}</h2>
      ${post.excerpt ? `<p class="excerpt">${escapeHtml(post.excerpt)}</p>` : ""}
      <div class="byline-inline">
        ${renderAuthorAvatars(post.authors.map((a) => ({ name: a.name, avatar_url: a.avatar_url })))}
        <span>${escapeHtml(authorsLine)}</span>
      </div>
    </div>
  </a>`;
}

export function renderBlogIndex({
  posts,
  categories,
  settings,
  activeCategory,
}: {
  posts: PublicPost[];
  categories: Category[];
  settings: {
    publisherName: string;
    publicBaseUrl?: string | null;
    defaultOgImageUrl?: string | null;
    defaultAuthorName?: string;
  };
  activeCategory?: string | null;
}) {
  const publisher = settings.publisherName || "SSR Blog Kit";
  const featuredPosts = activeCategory
    ? []
    : posts.filter((post) => post.featured);
  const regularPosts = featuredPosts.length
    ? posts.filter((post) => !post.featured)
    : posts;
  const cards = regularPosts.length
    ? regularPosts.map((post) => renderPostCard(post, settings)).join("")
    : `<div class="empty">Nenhum artigo publicado ainda.</div>`;

  const carousel = featuredPosts.length
    ? `<section class="featured-section" aria-labelledby="featured-title">
        <div class="section-heading">
          <div>
            <span class="section-kicker">Seleção editorial</span>
            <h2 id="featured-title">Em destaque</h2>
          </div>
          ${
            featuredPosts.length > 1
              ? `<div class="carousel-controls" aria-label="Controles do carrossel">
                  <button type="button" data-carousel-previous aria-label="Post anterior">←</button>
                  <button type="button" data-carousel-next aria-label="Próximo post">→</button>
                </div>`
              : ""
          }
        </div>
        <div class="featured-carousel" data-featured-carousel tabindex="0" aria-label="Posts em destaque">
          ${featuredPosts
            .map((post) => {
              const cover = resolvePostCover(post, settings);
              return `<a class="featured-slide${cover ? "" : " no-cover"}" href="/blog/${escapeHtml(post.slug)}">
                ${
                  cover
                    ? `<img class="featured-image" src="${escapeHtml(cover)}" alt="" loading="eager" />`
                    : ""
                }
                <span class="featured-overlay">
                  <h2>${escapeHtml(post.title)}</h2>
                </span>
              </a>`;
            })
            .join("")}
        </div>
      </section>`
    : "";

  const bodyHtml = `<div class="blog-index">
    ${carousel}
    <section class="latest-section" aria-labelledby="latest-title">
      <div class="section-heading section-heading--list">
        <h2 id="latest-title">${featuredPosts.length ? "Mais recentes" : "Publicações"}</h2>
      </div>
      <div class="post-list">${cards}</div>
    </section>
  </div>`;

  const base = publicBaseUrl(settings);
  return renderLayout({
    title: `Blog · ${publisher}`,
    description: `Artigos e atualizações de ${publisher}.`,
    canonicalPath: activeCategory
      ? `/blog?category=${encodeURIComponent(activeCategory)}`
      : "/blog",
    publisherName: publisher,
    settings,
    categories,
    activeCategory,
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: `${publisher} Blog`,
      url: `${base}/blog`,
      publisher: {
        "@type": "Organization",
        name: publisher,
        url: base,
      },
    },
    bodyHtml,
    pageScripts:
      featuredPosts.length > 1
        ? `<script>
          (function () {
            var carousel = document.querySelector('[data-featured-carousel]');
            var previous = document.querySelector('[data-carousel-previous]');
            var next = document.querySelector('[data-carousel-next]');
            if (!carousel) return;
            function move(direction) {
              var slide = carousel.querySelector('.featured-slide');
              var gap = parseFloat(getComputedStyle(carousel).gap) || 0;
              var distance = slide ? slide.getBoundingClientRect().width + gap : carousel.clientWidth;
              carousel.scrollBy({ left: direction * distance, behavior: 'smooth' });
            }
            if (previous) previous.addEventListener('click', function () { move(-1); });
            if (next) next.addEventListener('click', function () { move(1); });
          })();
        </script>`
        : undefined,
  });
}

export function renderNotFound(
  settings: {
    publisherName: string;
    publicBaseUrl?: string | null;
  },
  categories: Category[] = [],
) {
  return renderLayout({
    title: `Página não encontrada · ${settings.publisherName}`,
    description: "O conteúdo solicitado não existe.",
    canonicalPath: "/blog",
    publisherName: settings.publisherName,
    settings,
    categories,
    robots: "noindex, nofollow",
    bodyHtml: `<div class="not-found">
      <h1>404</h1>
      <p>Não encontramos este conteúdo.</p>
      <p><a href="/blog">Voltar ao blog</a></p>
    </div>`,
  });
}
