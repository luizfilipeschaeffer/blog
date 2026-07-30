import { renderRobots } from "@/lib/blog/render/feeds";
import { getSettings } from "@/lib/blog/services";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings();
  return new Response(renderRobots(settings), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
