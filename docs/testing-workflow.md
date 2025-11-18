# Testing & Validation Workflow

This document summarizes basic checks you can run locally and after deploying the CDM Suite Next.js app to Cloudflare Pages + Workers.

## 1. Local checks (before pushing)

From `cdm_suite_website/nextjs_space`:

```bash
npm install
npm run build
# Optional (lint may currently be misconfigured and fail):
# npm run lint
```

These commands ensure the app builds successfully before you push or open a pull request. `npm run build` should pass before you deploy. `npm run lint` is optional for now because ESLint / Next.js 14 CLI options may still be misconfigured and are being tracked separately.

Also run Prisma validation against your local database configuration:

```bash
npx prisma validate
```

If needed, you can additionally verify DB connectivity (using `DATABASE_DIRECT_URL`) with:

```bash
npx prisma db pull
```

## 2. Smoke-testing key APIs locally

When running the dev server:

```bash
npm run dev
```

You can hit key APIs under Node (not Edge) to verify business logic and auth flows:

```bash
curl -i http://localhost:3000/api/crm/stats
curl -i http://localhost:3000/api/credits   # requires an authenticated session
```

For routes that require IDs or payloads, you can follow the same pattern. Examples:

```bash
# Proposal payment link (requires a real proposal ID)
curl -i "http://localhost:3000/api/proposals/REAL_PROPOSAL_ID/payment-link"

# Reddit conversion test payload
curl -i http://localhost:3000/api/analytics/reddit-conversion \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "TestEvent",
    "click_id": "test-click-id",
    "timestamp": "2024-01-01T00:00:00Z"
  }'
```

These calls run under the Node runtime but still validate routing, payload handling, Prisma access via `lib/db.ts`, and most business logic before you deploy to Cloudflare.

## 3. Smoke-testing on Cloudflare

After deploying to Cloudflare Pages:

```bash
curl -i https://your-cloudflare-domain.com/api/crm/stats
curl -i https://your-cloudflare-domain.com/api/credits   # requires auth (e.g., NextAuth cookie)
```

You can repeat any of the local `curl` patterns against your Cloudflare hostname (including proposal payment links and Reddit conversion events) to confirm that the Edge runtime behaves as expected.

If you see unexpected responses or status codes, check:

- Cloudflare Pages / Functions logs for the project.
- Cloudflare Workers logs (if a route is deployed via Worker).
- Environment variables and secrets configuration, consistent with `cdm_suite_website/nextjs_space/docs/cloudflare-deployment.md`.

For Cloudflare-specific setup details and a more complete overview of Edge vs Node runtimes (Stripe, Reddit, etc.), see:

- `cdm_suite_website/nextjs_space/docs/cloudflare-deployment.md`
- `docs/edge-compatibility.md`