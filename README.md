# Kamaldeep Portfolio + Admin Panel

Static portfolio (original design/animations unchanged) supported by a Supabase-backed no-code admin panel.

## Local preview

With the HTTP server running on port 8000:

- Site root: `http://localhost:8000/` redirects to the portfolio
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

Hero/about, skills, projects, certifications, coding profiles, blog posts, media library and contact messages. Portfolio sections hide automatically when they have no published data; if Supabase is unreachable, the original hardcoded content stays visible.

## SEO metadata

Each portfolio route keeps its own title, description, Open Graph and Twitter tags in its HTML `<head>` (`portfolio/index.html` and `portfolio-zip/index.html`). These are static and unique per route, so the admin panel no longer overrides them. Sections stay in the same single page with their existing `id` and `h2`/`h3` headings.

## Files

- `index.html` — root page that redirects visitors to `/portfolio/`
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
# Optional: full URL of the deployed portfolio for the "View portfolio" link
VITE_PORTFOLIO_URL=https://your-portfolio-domain/
```

Then build:

```bash
cd admin-app
npm install
npm run build          # Vercel output: admin-app/dist
npm run build:admin    # local static-server output: ../admin/
```

`dist/` is git-ignored; `admin/` is the built output served at `/admin/` by the local HTTP server. Both portfolio pages load the same `admin-data.js`; `portfolio-zip/` keeps its own copy so the folder stays self-contained.

## Deploy the React admin to Vercel

The Vite/React app lives in `admin-app/` (the repository root has only a redirect `index.html` and no `package.json`), so Vercel must be pointed at that subfolder. `admin-app/vercel.json` contains the SPA rewrite to `/index.html`.

Vercel project settings:

| Setting | Value |
| --- | --- |
| Root Directory | `admin-app` |
| Framework Preset | Vite |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Add these Environment Variables in Vercel → Project Settings → Environment Variables (Production, Preview and Development), using the values from Supabase → Project Settings → API. They are read at **build time**, so redeploy after adding/changing them:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
# Optional but recommended: portfolio site URL for the "View portfolio" link.
# Without it the link resolves to /portfolio/ on the admin domain and will 404.
VITE_PORTFOLIO_URL=https://your-portfolio-domain/
```

This deploys the admin panel at the domain root. The public portfolio is a separate static site: deploy it with Root Directory `portfolio` (or `portfolio-zip`), Framework Preset "Other"/static, no build command and no output directory override.

Also set Supabase → Authentication → URL Configuration → **Site URL** to the deployed admin URL (e.g. `https://your-admin.vercel.app/`) and add that URL to **Redirect URLs**, so email confirmation and sign-in links return to the admin panel.
