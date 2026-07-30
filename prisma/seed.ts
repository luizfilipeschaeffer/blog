import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type SeedPost = {
  title: string;
  slug: string;
  excerpt: string;
  categorySlug: "produto" | "hardware" | "software" | "noticias";
  featured?: boolean;
  daysAgo: number;
};

const DEMO_POSTS: SeedPost[] = [
  {
    title: "Welcome to the editorial starter",
    slug: "welcome-editorial-starter",
    excerpt: "A monochrome SSR blog kit with feeds, TOC, and a shadcn admin.",
    categorySlug: "produto",
    featured: true,
    daysAgo: 1,
  },
  {
    title: "Shipping a clean changelog post",
    slug: "shipping-clean-changelog-post",
    excerpt: "Headings, excerpts, and cover images that work in the carousel.",
    categorySlug: "produto",
    featured: true,
    daysAgo: 2,
  },
  {
    title: "Choosing hardware for long writing sessions",
    slug: "hardware-long-writing-sessions",
    excerpt: "Keyboards, monitors, and desks that stay out of the way.",
    categorySlug: "hardware",
    featured: true,
    daysAgo: 3,
  },
  {
    title: "Markdown release notes that scale",
    slug: "markdown-release-notes-that-scale",
    excerpt: "Templates and skeletons for consistent release pages.",
    categorySlug: "software",
    daysAgo: 4,
  },
  {
    title: "JSON Feed and RSS in the same footer",
    slug: "json-feed-and-rss-footer",
    excerpt: "Syndication defaults that work out of the box.",
    categorySlug: "noticias",
    daysAgo: 5,
  },
  {
    title: "Theme switching without FOUC",
    slug: "theme-switching-without-fouc",
    excerpt: "Boot script, localStorage, and system preference.",
    categorySlug: "software",
    daysAgo: 6,
  },
  {
    title: "Preview drafts before publish",
    slug: "preview-drafts-before-publish",
    excerpt: "Authenticated preview with noindex and no view increments.",
    categorySlug: "produto",
    daysAgo: 7,
  },
  {
    title: "Responsive post grids that stay readable",
    slug: "responsive-post-grids",
    excerpt: "Four columns on widescreen, one column on mobile.",
    categorySlug: "produto",
    daysAgo: 8,
  },
  {
    title: "Postgres locally with Docker Compose",
    slug: "postgres-locally-docker-compose",
    excerpt: "A single compose service for first-run developer setup.",
    categorySlug: "hardware",
    daysAgo: 9,
  },
  {
    title: "Customize publisher name and public URL",
    slug: "customize-publisher-public-url",
    excerpt: "Settings singleton for brand, OG image, and syndication footer.",
    categorySlug: "noticias",
    daysAgo: 10,
  },
];

function daysAgoDate(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(12, 0, 0, 0);
  return d;
}

function coverFor(slug: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/1600/900`;
}

function bodyFor(title: string, excerpt: string) {
  return `## Context

${excerpt}

## Details

This sample post ships with **SSR Blog Kit** so you can exercise the index grid, featured carousel, category filters, and article TOC.

### Intermediate heading

Use \`h2\` and \`h3\` headings to verify outline generation.

## Next steps

Edit or delete sample posts from the admin, then publish your own content.
`;
}

async function main() {
  const adminEmail = (
    process.env.ADMIN_EMAIL || "admin@example.com"
  ).trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme";
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Luiz Filipe Schaeffer",
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: "admin",
      },
    });
    console.log(`Bootstrap admin criado: ${adminEmail}`);
  }

  await prisma.blogSettings.upsert({
    where: { id: 1 },
    update: {
      publisherName: "SSR Blog Kit",
      defaultAuthorName: "Luiz Filipe Schaeffer",
      publicBaseUrl: process.env.PUBLIC_URL || "http://localhost:3000",
      syndicationFooter:
        '<p>Thanks for reading. Subscribe via <a href="/feed.xml">RSS</a> or <a href="/feed.json">JSON Feed</a>.</p>',
    },
    create: {
      id: 1,
      publisherName: "SSR Blog Kit",
      defaultAuthorName: "Luiz Filipe Schaeffer",
      publicBaseUrl: process.env.PUBLIC_URL || "http://localhost:3000",
      syndicationFooter:
        '<p>Thanks for reading. Subscribe via <a href="/feed.xml">RSS</a> or <a href="/feed.json">JSON Feed</a>.</p>',
    },
  });

  const authors = await Promise.all([
    prisma.blogAuthor.upsert({
      where: { handle: "luizfilipe" },
      update: { displayName: "Luiz Filipe Schaeffer" },
      create: {
        handle: "luizfilipe",
        displayName: "Luiz Filipe Schaeffer",
      },
    }),
    prisma.blogAuthor.upsert({
      where: { handle: "alex" },
      update: { displayName: "Alex Writer" },
      create: { handle: "alex", displayName: "Alex Writer" },
    }),
    prisma.blogAuthor.upsert({
      where: { handle: "sam" },
      update: { displayName: "Sam Editor" },
      create: { handle: "sam", displayName: "Sam Editor" },
    }),
  ]);

  const [luiz, alex, sam] = authors;

  await prisma.blogSettings.update({
    where: { id: 1 },
    data: { defaultAuthorUserId: luiz.id },
  });

  const categoryDefs = [
    { name: "Produto", slug: "produto", sortOrder: 1 },
    { name: "Hardware", slug: "hardware", sortOrder: 2 },
    { name: "Software", slug: "software", sortOrder: 3 },
    { name: "Notícias", slug: "noticias", sortOrder: 4 },
  ];

  for (const cat of categoryDefs) {
    await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        sortOrder: cat.sortOrder,
        published: true,
        defaultCoverUrl: coverFor(`cat-${cat.slug}`),
      },
      create: {
        ...cat,
        published: true,
        defaultCoverUrl: coverFor(`cat-${cat.slug}`),
      },
    });
  }

  const produto = await prisma.blogCategory.findUniqueOrThrow({
    where: { slug: "produto" },
  });
  const noticias = await prisma.blogCategory.findUniqueOrThrow({
    where: { slug: "noticias" },
  });
  const software = await prisma.blogCategory.findUniqueOrThrow({
    where: { slug: "software" },
  });
  const hardware = await prisma.blogCategory.findUniqueOrThrow({
    where: { slug: "hardware" },
  });

  const categoryBySlug = { produto, hardware, software, noticias };

  const changelog = await prisma.blogTemplate.upsert({
    where: { slug: "changelog" },
    update: {},
    create: {
      name: "Changelog",
      slug: "changelog",
      description: "Product updates",
      categoryId: produto.id,
      excerptHint: "Summary of what changed in this version.",
      bodySkeleton: `## What changed\n\nDescribe the main updates.\n`,
      metaTitlePattern: "%s | Changelog",
      sortOrder: 1,
      active: true,
    },
  });

  await prisma.blogTemplate.upsert({
    where: { slug: "release" },
    update: {},
    create: {
      name: "Release",
      slug: "release",
      description: "Release announcement",
      categoryId: software.id,
      excerptHint: "A new version is available.",
      bodySkeleton: `## Highlights\n\nWhat is new in this release.\n`,
      metaTitlePattern: "%s | Release",
      sortOrder: 2,
      active: true,
    },
  });

  await prisma.blogTemplate.upsert({
    where: { slug: "soft-news" },
    update: {},
    create: {
      name: "Soft news",
      slug: "soft-news",
      description: "Short editorial note",
      categoryId: noticias.id,
      excerptHint: "A quick note about the topic.",
      bodySkeleton: `## Context\n\nWhy this matters.\n`,
      metaTitlePattern: "%s | News",
      sortOrder: 3,
      active: true,
    },
  });

  await prisma.blogPostAuthor.deleteMany();
  await prisma.blogPost.deleteMany();

  const authorPool = [luiz, alex, sam];
  let created = 0;

  for (const [index, item] of DEMO_POSTS.entries()) {
    const category = categoryBySlug[item.categorySlug];
    const author = authorPool[index % authorPool.length];
    const publishedAt = daysAgoDate(item.daysAgo);

    const post = await prisma.blogPost.create({
      data: {
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        body: bodyFor(item.title, item.excerpt),
        coverUrl: coverFor(item.slug),
        status: "published",
        featured: Boolean(item.featured),
        categoryId: category.id,
        templateId: changelog.id,
        authorUserId: author.id,
        metaTitle: item.title,
        metaDescription: item.excerpt,
        publishedAt,
        viewCount: 8 + ((index * 13) % 120),
      },
    });

    await prisma.blogPostAuthor.create({
      data: {
        postId: post.id,
        userId: author.id,
        role: "author",
        handle: author.handle,
        displayName: author.displayName,
        sortOrder: 0,
      },
    });

    if (index % 4 === 0) {
      const co = authorPool[(index + 1) % authorPool.length];
      if (co.id !== author.id) {
        await prisma.blogPostAuthor.create({
          data: {
            postId: post.id,
            userId: co.id,
            role: "coauthor",
            handle: co.handle,
            displayName: co.displayName,
            sortOrder: 1,
          },
        });
      }
    }

    created += 1;
  }

  // Remove leftover demo authors from older seeds if present
  await prisma.blogAuthor.deleteMany({
    where: { handle: { in: ["ana", "bruno", "editor"] } },
  });

  console.log(
    `Seed complete: ${created} posts (${DEMO_POSTS.filter((p) => p.featured).length} featured).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
