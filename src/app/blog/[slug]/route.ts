import { isAdminAuthenticated } from "@/lib/auth";
import { htmlResponse } from "@/lib/blog/http";
import { renderNotFound } from "@/lib/blog/render/index";
import { renderBlogPost } from "@/lib/blog/render/post";
import {
  getPostBySlug,
  getSettings,
  incrementPostViews,
  listPublishedCategories,
} from "@/lib/blog/services";
import { isPreviewQuery } from "@/lib/blog/utils";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const wantsPreview = isPreviewQuery(searchParams.get("preview"));
  const isAdmin = wantsPreview ? await isAdminAuthenticated() : false;
  const preview = wantsPreview && isAdmin;

  const [settings, post, categories] = await Promise.all([
    getSettings(),
    getPostBySlug(slug, { preview }),
    listPublishedCategories(),
  ]);

  if (!post) {
    return htmlResponse(renderNotFound(settings, categories), { status: 404 });
  }

  let views = post.view_count;
  if (!preview) {
    views = await incrementPostViews(post.id);
  }

  return htmlResponse(
    renderBlogPost({ post, settings, categories, preview, views }),
    {
      headers: preview
        ? { "Cache-Control": "no-store" }
        : { "Cache-Control": "public, max-age=60" },
    },
  );
}
