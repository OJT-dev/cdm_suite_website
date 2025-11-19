# CDM Suite — Cloudflare Edge Migration & Cleanup Implementation Plan

---

## 1. Objective

Migrate the entire **CDM Suite** platform to a **Cloudflare-native, edge-optimized architecture**, ensuring:
- Full compatibility with Cloudflare Workers and Pages
- Use of **Prisma Accelerate** for database access
- Removal of Node.js-only dependencies
- Safe cleanup of unused files (PDFs, reports, redundant markdowns)
- Relocation of documentation into a `/docs` directory
- Git repository optimization and sanitization
- Secure environment variable management via Cloudflare Secrets

---

## 2. Architecture Overview

### Current State
- Next.js app with multiple API routes under `/app/api`
- Prisma ORM with PostgreSQL
- Node.js runtime dependencies (fs, path, crypto)
- Large repository with hundreds of markdown and PDF artifacts
- Environment variables stored in `.env` files

### Target State
- **Cloudflare Edge Runtime** for all routes
- **Prisma Accelerate** for database access
- **Cloudflare Pages + Workers** for deployment
- **R2** for file storage (replacing local fs)
- **Durable Objects** for stateful workflows
- **Queues** for background jobs
- **Wrangler** for configuration and secret management

---

## 3. Migration Steps

### Step 1 — Edge Runtime Refactor
- Replace Node.js APIs with Web APIs (e.g., `fetch`, `crypto.subtle`)
- Replace `fs` operations with R2 or KV
- Use `@prisma/client/edge` and `DATABASE_URL` from Prisma Accelerate
- Remove any `require()` usage; use ES Modules only
- Ensure all API routes export `export const runtime = "edge"`

### Step 2 — Prisma Accelerate Integration
- Update `.env`:
  ```
  DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_REAL_KEY"
  ```
- Remove direct PostgreSQL connections
- Use `PrismaClient` from `@prisma/client/edge`
- Validate schema with `npx prisma validate`
- Test queries in Cloudflare Worker environment

### Step 3 — Environment Variables
Move all secrets to Cloudflare Dashboard or Wrangler:
| Variable | Description | Type | Required |
|-----------|--------------|------|-----------|
| DATABASE_URL | Prisma Accelerate URL | Secret | ✅ |
| STRIPE_SECRET_KEY | Stripe API key | Secret | ✅ |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret | Secret | ✅ |
| NEXTAUTH_SECRET | NextAuth encryption key | Secret | ✅ |
| NEXTAUTH_URL | Auth callback URL | Public | ✅ |
| NEXT_PUBLIC_POSTHOG_KEY | Analytics key | Public | ✅ |
| REDDIT_CONVERSION_TOKEN | Reddit API token | Secret | ✅ |
| RESEND_API_KEY | Email API key | Secret | ✅ |

Use:
```
npx wrangler secret put STRIPE_SECRET_KEY
```

---

## 4. Safe Cleanup Plan

### Strategy
- Identify unused files (not imported or referenced)
- Move all markdown documentation to `/docs`
- Delete redundant PDFs, test reports, and QA summaries
- Keep only:
  - `/app`, `/lib`, `/components`, `/prisma`, `/scripts`, `/public`
  - `/docs` (for documentation)
  - `/package.json`, `/next.config.js`, `.env.example`, `.gitignore`

### Implementation
1. Create `/docs` directory
2. Move all `.md` files except `README.md` and `project_todo.md` into `/docs`
3. Delete all `.pdf` files not referenced in code
4. Run `git add -A && git commit -m "cleanup: remove unused artifacts"`
5. Push to a new branch `cleanup/cloudflare-migration`

---

## 5. Git Optimization

### Steps
- Add `.gitignore` entries:
  ```
  *.pdf
  node_modules/
  .env
  .DS_Store
  .next/
  ```
- Use `git filter-repo` to remove large binary history:
  ```
  git filter-repo --path-glob '*.pdf' --invert-paths
  ```
- Force push cleaned branch:
  ```
  git push origin cleanup/cloudflare-migration --force
  ```

---

## 6. Deployment Workflow

### Cloudflare Pages
- Connect GitHub repo
- Set build command:
  ```
  npm run build
  ```
- Set output directory:
  ```
  .next
  ```
- Add environment variables in Pages dashboard

### Cloudflare Workers
- Use `wrangler.toml`:
  ```toml
  name = "cdm-suite"
  main = "dist/index.js"
  compatibility_date = "2025-11-16"
  ```
- Deploy:
  ```
  npx wrangler deploy
  ```

---

## 7. Testing & Validation

### Pre-deploy
- Run `npm run lint && npm run build`
- Validate all API routes with `curl` or Postman
- Test Stripe webhook locally using `stripe listen`
- Verify Prisma Accelerate connection with `npx prisma db pull`

### Post-deploy
- Validate Cloudflare logs
- Test AI endpoints and CRM workflows
- Confirm analytics and Reddit conversions fire correctly

---

## 8. Documentation Structure

Move all markdowns into `/docs`:
```
/docs
  ├── architecture.md
  ├── environment.md
  ├── cloudflare-deployment.md
  ├── cleanup-log.md
  ├── ai-pipeline.md
  ├── crm-overview.md
```

Keep only:
- `README.md`
- `project_todo.md`

---

## 9. Final Deliverables

- ✅ Edge-compatible Next.js app
- ✅ Prisma Accelerate integration
- ✅ Cloudflare Pages + Workers deployment
- ✅ Cleaned repository
- ✅ Organized `/docs` folder
- ✅ Git history sanitized
- ✅ Environment variables secured

---

## 10. Next Steps

1. Implement cleanup and refactor (toggle to Act Mode)
2. Test all routes in Cloudflare Edge runtime
3. Deploy to Cloudflare Pages
4. Validate Accelerate and Stripe integrations
5. Merge cleanup branch into main

---

**Author:** Cline (CodeFarm System)  
**Date:** 2025‑11‑16  
**Version:** 1.0  
**Status:** Ready for Execution
