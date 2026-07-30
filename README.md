# SSR Blog Kit

[▶ Assistir à demonstração do blog](https://github.com/luizfilipeschaeffer/blog/raw/master/doc/blog.mp4)

Editorial SSR blog starter: public HTML blog + shadcn/ui admin CMS.

Built with **Next.js 16**, **PostgreSQL** (Docker), **Prisma 7**, **marked**, and **lucide-react**.

## Features

- Public SSR pages (`/blog`, `/blog/:slug`) with monochrome design
- Theme switch (light / system / dark), GradualBlur, reading progress
- Featured carousel, responsive post grid, category nav in the header
- TOC, share tools, authors, scheduled posts, preview mode
- RSS, JSON Feed, sitemap, robots, Open Graph, JSON-LD
- Admin CMS: posts, categories, templates, settings, **multi-user auth**
- Password reset via **Resend**

## Prerequisites

- Node.js 20+
- Docker + Docker Compose
- npm
- (Optional) [Resend](https://resend.com) API key for password-reset e-mails

## Quick start

```bash
cp .env.example .env
npm install
npm run setup
npm run dev
```

Open:

- Blog: http://localhost:3000/blog
- Admin: http://localhost:3000/admin/login

Default bootstrap admin (first seed only):

- E-mail: `admin@example.com`
- Password: `changeme`

Change these before any real deploy.

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string |
| `PUBLIC_URL` | Absolute site URL for canonical/OG/feeds/reset links |
| `ADMIN_EMAIL` | Bootstrap admin e-mail (created when `users` is empty) |
| `ADMIN_PASSWORD` | Bootstrap admin password |
| `ADMIN_SESSION_SECRET` | HMAC secret for the session cookie |
| `RESEND_API_KEY` | Resend API key (required in production for reset e-mails) |
| `EMAIL_FROM` | From address, e.g. `SSR Blog Kit <onboarding@resend.dev>` |

### Auth model

- Users live in Postgres (`users`) with roles `admin` | `editor`
- Login uses **e-mail + password** (bcrypt)
- Session cookie is signed with `ADMIN_SESSION_SECRET`
- Only **admins** can create/manage users under Admin → Usuários
- Editors can manage content but not users
- Blog authors (`BlogAuthor`) stay separate from login accounts
- Forgot-password never reveals whether an e-mail exists
- Without `RESEND_API_KEY` in development, reset links are logged to the server console

In production, set strong `ADMIN_SESSION_SECRET`, `RESEND_API_KEY`, and `EMAIL_FROM`.

Docker credentials (`blog` / `blog`, database `ssr_blog`) are for local development only.

## Scripts

```bash
npm run setup        # docker up + migrate deploy + seed
npm run db:up        # start Postgres
npm run db:down      # stop Postgres
npm run db:migrate   # prisma migrate dev
npm run db:seed      # sample content + bootstrap admin if needed
npm run db:studio    # Prisma Studio
npm run dev          # Next.js dev server
npm run build        # production build
```

## Customize

1. Admin → **Settings**: publisher name, public URL, OG image, syndication footer
2. Admin → **Usuários**: invite editors/admins
3. Replace sample posts / authors / categories
4. Update `PUBLIC_URL` for the environment you deploy to

## Project layout

```text
src/app/blog          Public SSR routes
src/app/admin         Admin CMS (React + shadcn)
src/lib/auth.ts       Sessions, passwords, reset tokens
src/lib/email.ts      Resend delivery
src/lib/blog          Domain + HTML renderers
prisma/               Schema, migrations, seed
docker-compose.yml    Local Postgres
```

## License

MIT
