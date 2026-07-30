import {
  absoluteUrl,
  escapeHtml,
  markdownToHtml,
  publicBaseUrl,
  resolvePostCover,
  type PublicPost,
} from "@/lib/blog/utils";

function rfc822(date: Date | null | undefined) {
  if (!date) return new Date().toUTCString();
  return date.toUTCString();
}

export function renderRssFeed({
  posts,
  settings,
}: {
  posts: PublicPost[];
  settings: {
    publisherName: string;
    publicBaseUrl?: string | null;
    defaultOgImageUrl?: string | null;
    syndicationFooter?: string | null;
  };
}) {
  const base = publicBaseUrl(settings);
  const title = escapeHtml(`${settings.publisherName} Blog`);
  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`, settings);
      const cover = resolvePostCover(post, settings);
      const html =
        markdownToHtml(post.body) +
        (settings.syndicationFooter
          ? `<hr/>${settings.syndicationFooter}`
          : "");
      return `<item>
  <title>${escapeHtml(post.title)}</title>
  <link>${escapeHtml(url)}</link>
  <guid isPermaLink="true">${escapeHtml(url)}</guid>
  <pubDate>${rfc822(post.published_at)}</pubDate>
  ${post.category_name ? `<category>${escapeHtml(post.category_name)}</category>` : ""}
  <description>${escapeHtml(post.excerpt || post.title)}</description>
  <content:encoded><![CDATA[${html}]]></content:encoded>
  ${cover ? `<enclosure url="${escapeHtml(absoluteUrl(cover, settings))}" type="image/jpeg" />` : ""}
</item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <link>${escapeHtml(`${base}/blog`)}</link>
    <description>${escapeHtml(`Artigos e atualizações de ${settings.publisherName}.`)}</description>
    <language>pt-BR</language>
    <atom:link href="${escapeHtml(`${base}/feed.xml`)}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
}

export function renderJsonFeed({
  posts,
  settings,
}: {
  posts: PublicPost[];
  settings: {
    publisherName: string;
    publicBaseUrl?: string | null;
    defaultOgImageUrl?: string | null;
    syndicationFooter?: string | null;
  };
}) {
  const base = publicBaseUrl(settings);
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: `${settings.publisherName} Blog`,
    home_page_url: `${base}/blog`,
    feed_url: `${base}/feed.json`,
    description: `Artigos e atualizações de ${settings.publisherName}.`,
    language: "pt-BR",
    items: posts.map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`, settings);
      const cover = resolvePostCover(post, settings);
      const html =
        markdownToHtml(post.body) +
        (settings.syndicationFooter
          ? `<hr/>${settings.syndicationFooter}`
          : "");
      return {
        id: url,
        url,
        title: post.title,
        summary: post.excerpt || post.title,
        content_html: html,
        image: cover ? absoluteUrl(cover, settings) : undefined,
        date_published: post.published_at?.toISOString(),
        date_modified: post.updated_at.toISOString(),
        tags: post.category_name ? [post.category_name] : [],
        authors: post.authors.map((a) => ({ name: a.name })),
      };
    }),
  };
}

export function renderSitemap({
  posts,
  settings,
}: {
  posts: { slug: string; updatedAt: Date; publishedAt: Date | null }[];
  settings: { publicBaseUrl?: string | null };
}) {
  const base = publicBaseUrl(settings);
  const urls = [
    `<url><loc>${base}/blog</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`,
    ...posts.map((p) => {
      const lastmod = (p.updatedAt || p.publishedAt || new Date())
        .toISOString()
        .slice(0, 10);
      return `<url><loc>${base}/blog/${p.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    }),
  ].join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export function renderRobots(settings: { publicBaseUrl?: string | null }) {
  const base = publicBaseUrl(settings);
  return `User-agent: *
Allow: /blog
Allow: /feed.xml
Allow: /feed.json
Allow: /sitemap-blog.xml
Disallow: /admin

Sitemap: ${base}/sitemap-blog.xml
`;
}
