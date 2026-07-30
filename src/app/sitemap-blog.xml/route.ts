import { renderSitemap } from "@/lib/blog/render/feeds";
import { getSettings, listPostsForSitemap } from "@/lib/blog/services";

export const dynamic = "force-dynamic";

export async function GET() {
  const [settings, posts] = await Promise.all([
    getSettings(),
    listPostsForSitemap(1000),
  ]);
  const xml = renderSitemap({ posts, settings });
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
