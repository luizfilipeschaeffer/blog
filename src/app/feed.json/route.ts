import { renderJsonFeed } from "@/lib/blog/render/feeds";
import { getSettings, listPostsForFeed } from "@/lib/blog/services";

export const dynamic = "force-dynamic";

export async function GET() {
  const [settings, posts] = await Promise.all([
    getSettings(),
    listPostsForFeed(50),
  ]);
  const json = renderJsonFeed({ posts, settings });
  return Response.json(json, {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=120",
    },
  });
}
