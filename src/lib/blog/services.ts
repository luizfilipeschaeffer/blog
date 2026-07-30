import { prisma } from "@/lib/prisma";
import type { BlogPost, BlogPostAuthor, BlogAuthor, BlogCategory } from "@/generated/prisma/client";
import {
  applyTemplateFields,
  slugify,
  type PublicAuthor,
  type PublicPost,
} from "@/lib/blog/utils";

type PostWithRelations = BlogPost & {
  category: BlogCategory | null;
  authors: (BlogPostAuthor & { author: BlogAuthor })[];
};

function toPublicPost(post: PostWithRelations): PublicPost {
  const authors: PublicAuthor[] = [...post.authors]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((row) => ({
      user_id: row.userId,
      role: row.role,
      handle: row.handle || row.author.handle,
      name: row.displayName || row.author.displayName,
      avatar_url: row.author.avatarUrl || "",
      sort_order: row.sortOrder,
    }));

  const primary = authors.find((a) => a.role === "author") || authors[0];

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    body: post.body,
    cover_url: post.coverUrl,
    status: post.status,
    featured: post.featured,
    meta_title: post.metaTitle,
    meta_description: post.metaDescription,
    published_at: post.publishedAt,
    updated_at: post.updatedAt,
    view_count: post.viewCount,
    category_name: post.category?.name ?? null,
    category_slug: post.category?.slug ?? null,
    category_default_cover_url: post.category?.defaultCoverUrl ?? "",
    authors,
    author_name: primary?.name || "",
    author_handle: primary?.handle || "",
    author_avatar_url: primary?.avatar_url || "",
    coauthors: authors.filter((a) => a.role === "coauthor"),
  };
}

const postInclude = {
  category: true,
  authors: {
    include: { author: true },
    orderBy: { sortOrder: "asc" as const },
  },
};

export async function getSettings() {
  let settings = await prisma.blogSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.blogSettings.create({
      data: {
        id: 1,
        publisherName: "SSR Blog Kit",
        defaultAuthorName: "Luiz Filipe Schaeffer",
        publicBaseUrl: process.env.PUBLIC_URL || "http://localhost:3000",
      },
    });
  }
  return settings;
}

export async function promoteDueScheduledPosts() {
  const now = new Date();
  await prisma.blogPost.updateMany({
    where: {
      status: "scheduled",
      scheduledFor: { lte: now },
    },
    data: {
      status: "published",
      publishedAt: now,
    },
  });
}

export async function ensureUniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "post";
  let candidate = root;
  let i = 2;
  while (true) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || (excludeId && existing.id === excludeId)) {
      return candidate;
    }
    candidate = `${root}-${i}`;
    i += 1;
  }
}

export async function listPublishedCategories() {
  return prisma.blogCategory.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function listPublishedPosts(categorySlug?: string | null) {
  await promoteDueScheduledPosts();
  const posts = await prisma.blogPost.findMany({
    where: {
      status: "published",
      ...(categorySlug
        ? { category: { slug: categorySlug, published: true } }
        : {}),
    },
    include: postInclude,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });
  return posts.map(toPublicPost);
}

export async function getPostBySlug(slug: string, { preview = false } = {}) {
  await promoteDueScheduledPosts();
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: postInclude,
  });
  if (!post) return null;
  if (!preview && post.status !== "published") return null;
  return toPublicPost(post);
}

export async function incrementPostViews(postId: string) {
  const updated = await prisma.blogPost.updateMany({
    where: { id: postId, status: "published" },
    data: { viewCount: { increment: 1 } },
  });
  if (!updated.count) return 0;
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { viewCount: true },
  });
  return post?.viewCount ?? 0;
}

export async function listPostsForFeed(limit = 50) {
  await promoteDueScheduledPosts();
  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    include: postInclude,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return posts.map(toPublicPost);
}

export async function listPostsForSitemap(limit = 1000) {
  await promoteDueScheduledPosts();
  return prisma.blogPost.findMany({
    where: { status: "published" },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function listAllPostsAdmin(filters?: {
  status?: string;
  q?: string;
}) {
  return prisma.blogPost.findMany({
    where: {
      ...(filters?.status && filters.status !== "all"
        ? { status: filters.status as "draft" | "scheduled" | "published" }
        : {}),
      ...(filters?.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: "insensitive" } },
              { slug: { contains: filters.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      authors: { include: { author: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPostAdmin(id: string) {
  return prisma.blogPost.findUnique({
    where: { id },
    include: {
      category: true,
      template: true,
      authors: { include: { author: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export type PostInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  coverUrl?: string;
  status?: "draft" | "scheduled" | "published";
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  categoryId?: string | null;
  templateId?: string | null;
  scheduledFor?: string | null;
  authorId?: string | null;
  coauthorIds?: string[];
};

async function syncAuthors(
  postId: string,
  authorId: string | null | undefined,
  coauthorIds: string[] = [],
) {
  await prisma.blogPostAuthor.deleteMany({ where: { postId } });
  if (!authorId) return;

  const author = await prisma.blogAuthor.findUnique({ where: { id: authorId } });
  if (!author) return;

  await prisma.blogPostAuthor.create({
    data: {
      postId,
      userId: author.id,
      role: "author",
      handle: author.handle,
      displayName: author.displayName,
      sortOrder: 0,
    },
  });

  const uniqueCo = [...new Set(coauthorIds)].filter((id) => id !== authorId);
  let order = 1;
  for (const id of uniqueCo) {
    const co = await prisma.blogAuthor.findUnique({ where: { id } });
    if (!co) continue;
    await prisma.blogPostAuthor.create({
      data: {
        postId,
        userId: co.id,
        role: "coauthor",
        handle: co.handle,
        displayName: co.displayName,
        sortOrder: order++,
      },
    });
  }

  await prisma.blogPost.update({
    where: { id: postId },
    data: { authorUserId: author.id },
  });
}

function resolveStatusDates(input: PostInput, existing?: BlogPost | null) {
  let status = input.status || existing?.status || "draft";
  let publishedAt = existing?.publishedAt ?? null;
  let scheduledFor: Date | null = null;

  if (input.scheduledFor) {
    scheduledFor = new Date(input.scheduledFor);
  }

  if (status === "scheduled") {
    if (!scheduledFor) {
      status = "draft";
    } else if (scheduledFor.getTime() <= Date.now()) {
      status = "published";
      publishedAt = publishedAt || new Date();
      scheduledFor = null;
    } else {
      publishedAt = null;
    }
  } else if (status === "published") {
    publishedAt = publishedAt || new Date();
    scheduledFor = null;
  } else {
    scheduledFor = null;
  }

  return { status, publishedAt, scheduledFor };
}

export async function createPost(input: PostInput) {
  const settings = await getSettings();
  const slug = await ensureUniqueSlug(input.slug || input.title);
  const dates = resolveStatusDates(input);
  const authorId = input.authorId || settings.defaultAuthorUserId;

  const post = await prisma.blogPost.create({
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt || "",
      body: input.body || "",
      coverUrl: input.coverUrl || "",
      status: dates.status,
      featured: Boolean(input.featured),
      metaTitle: input.metaTitle || "",
      metaDescription: input.metaDescription || "",
      categoryId: input.categoryId || null,
      templateId: input.templateId || null,
      publishedAt: dates.publishedAt,
      scheduledFor: dates.scheduledFor,
      authorUserId: authorId || null,
    },
  });

  await syncAuthors(post.id, authorId, input.coauthorIds || []);
  return getPostAdmin(post.id);
}

export async function updatePost(id: string, input: PostInput) {
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return null;

  const slug = await ensureUniqueSlug(
    input.slug || input.title || existing.slug,
    id,
  );
  const dates = resolveStatusDates(input, existing);

  await prisma.blogPost.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt ?? "",
      body: input.body ?? "",
      coverUrl: input.coverUrl ?? "",
      status: dates.status,
      featured: Boolean(input.featured),
      metaTitle: input.metaTitle ?? "",
      metaDescription: input.metaDescription ?? "",
      categoryId: input.categoryId || null,
      templateId: input.templateId || null,
      publishedAt: dates.publishedAt,
      scheduledFor: dates.scheduledFor,
    },
  });

  if (input.authorId !== undefined) {
    await syncAuthors(id, input.authorId, input.coauthorIds || []);
  }

  return getPostAdmin(id);
}

export async function deletePost(id: string) {
  await prisma.blogPost.delete({ where: { id } });
}

export async function createPostFromTemplate(templateId: string) {
  const template = await prisma.blogTemplate.findUnique({
    where: { id: templateId },
  });
  if (!template) throw new Error("Template não encontrado");
  const fields = applyTemplateFields(template);
  const settings = await getSettings();
  return createPost({
    title: fields.title || "Novo artigo",
    excerpt: fields.excerpt,
    body: fields.body,
    coverUrl: fields.cover_url,
    metaTitle: fields.meta_title,
    metaDescription: fields.meta_description,
    categoryId: fields.category_id,
    templateId: fields.template_id,
    status: "draft",
    authorId: settings.defaultAuthorUserId,
  });
}
