# Kamaldeep Portfolio + Admin Panel

Static portfolio (original design/animations unchanged) supported by a Supabase-backed no-code admin panel.

## Local preview

With the HTTP server running on port 8000:

- Portfolio: `http://localhost:8000/portfolio/`
- Zip version: `http://localhost:8000/portfolio-zip/`
- Admin panel: `http://localhost:8000/admin/`

Codespaces public URLs use the same paths with `https://<codespace>-8000.app.github.dev/`.

## Supabase setup (one time)

1. Open Supabase Dashboard → SQL Editor.
2. Run `supabase-setup.sql` from this folder. It grants read access, fixes RLS policies, creates the `media` bucket and seeds the site settings row.
3. Authentication → Users → Add user with email `kamalsheokand615@gmail.com` and a password. Confirm the email (or disable confirmation for dev).
4. Sign in at `/admin/`.

Do **not** re-run the kit's `supabase/schema.sql`; the tables are already there.

## What the admin can edit

Hero/about/SEO, skills, projects, certifications, coding profiles, blog posts, media library and contact messages. Portfolio sections hide automatically when they have no published data; if Supabase is unreachable, the original hardcoded content stays visible.

## Files

- `portfolio/index.html`, `portfolio-zip/index.html` — portfolio pages
- `portfolio/admin-data.js` — shared Supabase data layer for both pages
- `admin-app/` — React admin source built from `portfolio-admin-kit.zip` (`Admin.jsx`, `admin.css`, `usePortfolio.js` pattern)
- `admin/` — built admin output; served at `/admin/`
- `supabase-setup.sql` — permissions/policies fix
- `admin-legacy/` — older static admin (kept for reference, not used by the current setup)

## Rebuild admin after edits

Create `admin-app/.env` first (it is git-ignored), using the URL and anon key from Supabase → Project Settings → API:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then build:

```bash
cd admin-app
npm install
npm run build
```

The build writes straight into `admin/`. Both portfolio pages load the same `admin-data.js`; `portfolio-zip/` keeps its own copy so the folder stays self-contained.
