# News Site — Setup Guide

This folder contains the extra code layered on top of your existing `create-next-app` project
(App Router + TypeScript + Tailwind). Merge these files into your `news-site` project, then follow
the steps below.

## 1. Install dependencies

Run this from your project root (`C:\Users\GUNA\Next JS\news-site`):

```bash
npm install @prisma/client next-auth@beta bcryptjs @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
npm install -D prisma tsx @types/bcryptjs
```

## 2. Copy the files

Copy everything from this package into your project, matching folder paths:
- `prisma/schema.prisma`, `prisma/seed.ts` → `prisma/`
- `app/`, `components/`, `lib/` → your project root
- `next.config.ts`, `.env.example` → project root (merge `next.config.ts` if you already customized it)

## 3. Set up environment variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
npx auth secret   # writes AUTH_SECRET into .env automatically
```

For `DATABASE_URL`, create a free Postgres database at one of:
- https://supabase.com (free tier, 500MB)
- https://neon.tech (free tier, 512MB, serverless)

Copy the connection string they give you into `DATABASE_URL` in `.env`.

## 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

Add a seed script entry to `package.json`:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

Then seed sample data (an admin user, a writer, categories, and one published article):

```bash
npx prisma db seed
```

This creates:
- `admin@example.com` / `password123` (role: ADMIN — can publish directly)
- `writer@example.com` / `password123` (role: WRITER — submits drafts for review)

**Change these passwords or delete these accounts before going live.**

## 5. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`. Sign in at `/login`, then go to `/dashboard` to write and publish articles.

## 6. Before deploying

- Update `lib/site.ts` with your real site name, description, and URL.
- Set `NEXT_PUBLIC_SITE_URL` in your production environment to your real domain.
- Tighten `next.config.ts` image `remotePatterns` to your actual image host (Supabase Storage / Cloudinary domain) instead of `**`.
- Replace the placeholder `public/logo.png` and `public/og-default.png` (referenced in JSON-LD and Open Graph tags).
- Deploy to Vercel free tier (recommended — pairs best with Next.js ISR) and connect your Supabase/Neon `DATABASE_URL`.

## What's included

- **Roles**: ADMIN / EDITOR / WRITER / READER, enforced in `proxy.ts` and API routes.
- **Article workflow**: Writers save drafts → submit for review → Editors/Admins publish.
- **SEO**: per-page `generateMetadata` (title, description, canonical, Open Graph, Twitter cards), `sitemap.ts`, `robots.ts`.
- **JSON-LD**: `NewsMediaOrganization` (root layout), `WebSite` + `SearchAction` (homepage), `NewsArticle` + `BreadcrumbList` (article pages).
- **ISR**: homepage/article/category pages revalidate on a timer instead of full SSR, so they're fast and stay reasonably fresh.
- **Editor**: Tiptap rich text editor (bold, italic, headings, lists, quotes, images, links) storing both HTML (for rendering) and JSON (for re-editing).

## Suggested next steps

- Add image upload (Supabase Storage or UploadThing) instead of pasting image URLs in the editor.
- Add a `/dashboard/users` admin page to manage roles (model supports it; UI not included yet).
- Add comments UI (the `Comment` model is already in the schema).
- Add pagination on the homepage/category pages once article count grows past ~30.
