# AGENTS.md

This file provides guidance to agents when working with code in this repository. It intentionally documents only non-obvious, project-specific behavior.

## Stack & project layout (non-obvious)

- The Next.js 14 app lives under `nextjs_space/`; run all `npm` scripts from `nextjs_space/`, not from the repo root.
- The root `package.json` mirrors `nextjs_space/package.json`, but `nextjs_space` is the source of truth for scripts and dependencies.
- Package manager is `npm` (lockfile is `package-lock.json`); `.yarnrc.yml` exists but CI and docs assume `npm` commands.

## Build / lint / DB checks

- Local build check (from repo root): `cd nextjs_space && npm install && npm run build`.
- ESLint is wired via `next lint` but `docs/testing-workflow.md` notes it may be misconfigured; treat lint failures as a known issue unless you are explicitly fixing ESLint config.
- Prisma validation must use the direct Postgres URL: from `nextjs_space/` run `npx prisma validate` and, if needed, `npx prisma db pull` against `DATABASE_DIRECT_URL` (not `DATABASE_URL`).

## "Single test" / smoke testing

- There is no Jest/Vitest-style unit test runner; testing is primarily targeted HTTP calls against a running dev server or Cloudflare deployment.
- To smoke-test locally: `cd nextjs_space && npm run dev`, then hit key APIs such as:
  - `curl -i http://localhost:3000/api/crm/stats`
  - `curl -i http://localhost:3000/api/credits` (requires an authenticated session)
  - `curl -i http://localhost:3000/api/analytics/reddit-conversion` with a minimal JSON body (see `docs/testing-workflow.md` for exact examples).

## Edge vs Node runtime constraints

- Many CRM, workflow, credits, affiliate, and analytics routes are intentionally Edge-based; `docs/edge-compatibility.md` is the canonical list. When adding similar routes, copy runtime + helper usage from an existing Edge route.
- Stripe-heavy routes and document-generation endpoints (Word/PDF) are **Node-only**. Do not move them to Edge and do not import the Stripe Node SDK, `docx`, or `pdf-lib` into Edge-marked modules.
- When creating new APIs, keep their runtime (Edge vs Node) consistent with neighboring routes that use the same dependencies.

## Cloudflare-specific build details

- Cloudflare Pages uses `@cloudflare/next-on-pages`; the build output is expected in `.vercel/output/static` and is wired via `nextjs_space/wrangler.toml`.
- If you change build or output paths, update both `wrangler.toml` and the Cloudflare Pages project settings together; mismatches will cause non-obvious build failures.

## Environment variables

- `DATABASE_DIRECT_URL` is for CLI tools and migrations; `DATABASE_URL` is a `prisma://` Accelerate/Data Proxy URL used at runtime by Edge-safe Prisma code.
- When adding new Prisma or DB tooling, re-use this split: new CLI commands should consume `DATABASE_DIRECT_URL`, while application code should keep using `DATABASE_URL` unless there is a strong reason to do otherwise.