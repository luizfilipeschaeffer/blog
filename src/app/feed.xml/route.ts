import { renderRssFeed } from "@/lib/blog/render/feeds";
import { getSettings, listPostsForFeed } from "@/lib/blog/services";

export const dynamic = "force-dynamic";

export async function GET() {
  const [settings, posts] = await Promise.all([
    getSettings(),
    listPostsForFeed(50),
  ]);
  const xml = renderRssFeed({ posts, settings });
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=120",
    },
  });
}
