import { htmlResponse } from "@/lib/blog/http";
import { renderBlogIndex } from "@/lib/blog/render/index";
import {
  getSettings,
  listPublishedCategories,
  listPublishedPosts,
} from "@/lib/blog/services";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const [settings, categories, posts] = await Promise.all([
    getSettings(),
    listPublishedCategories(),
    listPublishedPosts(category),
  ]);

  const html = renderBlogIndex({
    posts,
    categories,
    settings,
    activeCategory: category,
  });

  return htmlResponse(html);
}
