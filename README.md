# Robins Web + Strapi CMS

## Local development

### 1) Start CMS stack (Strapi + Postgres)

1. Copy root `.env.example` to `.env`.
2. Copy `cms/.env.example` to `cms/.env`.
3. Run:

```bash
docker compose up -d --build
```

Strapi admin: `http://localhost:1337/admin`

### 2) Run frontend

1. Copy `app/.env.example` to `app/.env`.
2. Run:

```bash
cd app
npm install
npm run dev
```

Frontend: `http://localhost:5173`

### 3) Seeding

- Seed runs on bootstrap when `SEED_ON_BOOTSTRAP=true`.
- To disable reseeding, set `SEED_ON_BOOTSTRAP=false`.

## Free hosting (Cloudflare Pages + Render + Neon + Cloudinary)

This repo is prepared for:

- Frontend: Cloudflare Pages (free)
- CMS API: Render Web Service (free)
- Database: Neon Postgres (free)
- Media uploads: Cloudinary (free)

### 1) Create Neon Postgres

1. Create a Neon project.
2. Copy the connection string.
3. Use it as `DATABASE_URL` in Render.

Recommended format includes SSL, for example:

`postgresql://USER:PASSWORD@HOST/DB?sslmode=require`

### 2) Create Cloudinary account

Get these values:

- `CLOUDINARY_NAME`
- `CLOUDINARY_KEY`
- `CLOUDINARY_SECRET`

### 3) Deploy Strapi on Render

1. Push this repo to GitHub/GitLab.
2. In Render, create a **Blueprint** and select this repo.
3. Render uses `render.yaml` and deploys `robins-cms` with `cms/Dockerfile.render`.
4. Fill required env values in Render:

- `PUBLIC_URL` = your Render URL (example `https://robins-cms.onrender.com`)
- `APP_KEYS` (comma-separated 4 random strings)
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`
- `DATABASE_URL` (Neon connection string)
- `CORS_ORIGINS` (comma-separated allowed frontend origins)
- `CLOUDINARY_NAME`
- `CLOUDINARY_KEY`
- `CLOUDINARY_SECRET`

Suggested:

- `SEED_ON_BOOTSTRAP=false` for production
- `REELLY_IMPORT_ON_BOOTSTRAP=false` unless intentionally importing on every boot

### 4) Deploy frontend on Cloudflare Pages

Create a Pages project with:

- Framework preset: `Vite`
- Root directory: `app`
- Build command: `npm run build`
- Build output directory: `dist`

Set env vars in Cloudflare Pages:

- `VITE_STRAPI_URL=https://your-render-strapi-url`
- `VITE_SITE_URL=https://your-pages-domain`

`app/public/_redirects` is included so SPA routes work on refresh.

### 5) Strapi permissions (required)

In Strapi Admin -> Settings -> Users & Permissions -> Roles -> Public:

Enable `find/findOne` for:

- `site-config`
- `home-page`
- `properties`
- `neighborhoods`
- `blog-posts`
- `faq-categories`

### 6) CORS notes

- Local origins are already included in `cms/config/middlewares.ts`.
- `CORS_ORIGINS` adds production domains.
- `*.pages.dev` and `*.workers.dev` are accepted by regex in middleware config.

## Files added/updated for hosting

- `render.yaml`
- `cms/Dockerfile.render`
- `cms/config/plugins.ts` (Cloudinary upload provider support)
- `cms/config/middlewares.ts` (env-based CORS)
- `cms/config/server.ts` (`PUBLIC_URL`, proxy support)
- `cms/.env.example`
- `.env.example`
- `app/.env.example`
- `app/public/_redirects`

## Troubleshooting

- CORS blocked: verify `CORS_ORIGINS` includes your exact frontend domain.
- Images missing after restart: ensure Cloudinary env vars are set (free tiers are ephemeral without external media storage).
- Empty API data: verify Public role permissions in Strapi.
- First load slow on free tier: Render free services sleep when idle and need cold start.
## Optional: GitHub Actions auto-deploy

This repo includes:

- `.github/workflows/deploy-frontend-cloudflare.yml`
- `.github/workflows/deploy-cms-render.yml`

Add these GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT`
- `VITE_STRAPI_URL`
- `VITE_SITE_URL`
- `RENDER_DEPLOY_HOOK_URL`

Then run workflows from GitHub Actions tab:

1. `Deploy Frontend (Cloudflare Pages)`
2. `Deploy CMS (Render)`

Note:

- For Render deploy hook, first create the Render service once (Blueprint), then copy its Deploy Hook URL into `RENDER_DEPLOY_HOOK_URL`.
