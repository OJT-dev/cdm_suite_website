# Cloudflare Deployment for CDM Suite Next.js App

## Overview

This Next.js app in `cdm_suite_website/nextjs_space` is being prepared for Cloudflare Pages + Workers and the Edge runtime:

- Database access uses Prisma Accelerate via [`lib/db.ts`](cdm_suite_website/nextjs_space/lib/db.ts:1) and the `DATABASE_URL` environment variable (an Accelerate URL in Cloudflare).
- Many API routes are configured for the Edge runtime with `export const runtime = 'edge';`, including CRM stats, team workload, workflows, proposals payment link, affiliate, bid-proposals analytics/reminders, and Reddit conversion.
- Node-only routes (Stripe Node SDK, heavy cron/sequence processing, some document-generation endpoints) continue to run on the Node.js runtime for now.

## Environment variables and secrets

Configure the following for Cloudflare Pages and/or Workers.

### Secrets (use `wrangler secret put` or Pages “Encrypted variables”)

These must not be exposed as plain `[vars]` in `wrangler.toml`:

- `DATABASE_URL` — Prisma Accelerate URL (e.g. `prisma://...`).
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXTAUTH_SECRET`
- `REDDIT_CONVERSION_TOKEN`
- `RESEND_API_KEY`
- `ADMIN_EMAIL`
- `CRON_SECRET` — shared with cron endpoints such as [`app/api/bid-proposals/reminders/route.ts`](cdm_suite_website/nextjs_space/app/api/bid-proposals/reminders/route.ts:1) and [`app/api/cron/process-sequences/route.ts`](cdm_suite_website/nextjs_space/app/api/cron/process-sequences/route.ts:1).

Example commands (run from `cdm_suite_website/nextjs_space`):

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put NEXTAUTH_SECRET
npx wrangler secret put REDDIT_CONVERSION_TOKEN
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put CRON_SECRET
```

`DATABASE_DIRECT_URL` is primarily used locally by Prisma CLI tooling (see [`prisma/schema.prisma`](cdm_suite_website/nextjs_space/prisma/schema.prisma:1)) and normally does not need to be set in Cloudflare.

### Public / build-time variables

These can be configured as regular environment variables in Cloudflare Pages, or under `[vars]` in [`wrangler.toml`](cdm_suite_website/nextjs_space/wrangler.toml:1) for Workers:

- `NEXTAUTH_URL`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_REDDIT_PIXEL_ID`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Public `NEXT_PUBLIC_*` variables do not need to be secrets, but they should still match your production URLs and project keys.

## Cloudflare Pages configuration (Next.js app)

In Cloudflare Pages, configure a project that points at the `cdm_suite_website/nextjs_space` directory.

- **Build command**

  ```bash
  npm run build
  ```

- **Output directory**

  ```text
  .next
  ```

The Cloudflare Next.js integration will deploy routes and middleware appropriately, including API routes that explicitly export `export const runtime = 'edge';`.

## Cloudflare Workers configuration (optional)

The repo includes a [`wrangler.toml`](cdm_suite_website/nextjs_space/wrangler.toml:1) configured as:

```toml
name = "cdm-suite"
main = "dist/index.js"
compatibility_date = "2025-11-16"
```

This can be used to deploy:

- Additional Worker-based APIs.
- Background tasks or schedulers (for example, moving cron endpoints off Pages and into a Worker).

Secrets for Workers must be configured with `wrangler secret put`, consistent with the list above. Public variables (for example `NEXT_PUBLIC_POSTHOG_KEY`) may be set under `[vars]`.

Future work may introduce extra Cloudflare bindings (Durable Objects, Queues, R2, etc.) as needed for advanced workloads; none are required for the current Edge-ready subset of routes.

## Testing & Validation

This section summarizes practical checks to run before and after deploying to Cloudflare Pages + Workers. It aligns with the Testing & Validation steps in [`implementation_plan.md`](implementation_plan.md:1).

### Local pre-deploy checks

From `cdm_suite_website/nextjs_space`:

```bash
npm install
npm run build
# Optional (lint may currently be misconfigured and fail):
# npm run lint
```

- `npm run build` should succeed locally before you push or trigger a Cloudflare deployment.
- `npm run lint` is optional for now; failures may be due to known Next.js 14 / ESLint CLI option issues and are being tracked as a separate task.

Prisma checks (using your local `DATABASE_DIRECT_URL` and `DATABASE_URL`):

```bash
npx prisma validate
npx prisma db pull   # confirms connectivity against DATABASE_DIRECT_URL locally
```

- `npx prisma validate` ensures the Prisma schema is valid and compatible with the configured database.
- `npx prisma db pull` is a quick way to verify that your local Prisma CLI can reach the database before you rely on it in Cloudflare.

You can also run the app locally under Node:

```bash
npm run dev
```

This uses the Node runtime (not Cloudflare’s Edge runtime) but is still useful to catch obvious regressions in routing, auth, and core business logic before deploying.

### Post-deploy checks on Cloudflare

After a successful Cloudflare Pages deployment, verify that key Edge routes respond as expected. Replace `https://your-cloudflare-domain.com` with your actual Pages/Workers hostname.

Key routes to check:

- `/api/crm/stats`
- `/api/credits`
- `/api/proposals/[id]/payment-link` (requires a real proposal ID)
- `/api/analytics/reddit-conversion` (test payload)

Example `curl` commands:

```bash
# CRM stats (public or minimally protected)
curl -i https://your-cloudflare-domain.com/api/crm/stats

# Credits for logged-in user (requires auth; example for cookie-based NextAuth)
curl -i \
  --cookie "next-auth.session-token=YOUR_SESSION_TOKEN" \
  https://your-cloudflare-domain.com/api/credits

# Reddit conversion test payload (ensure you use a test or low-impact event)
curl -i https://your-cloudflare-domain.com/api/analytics/reddit-conversion \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "TestEvent",
    "click_id": "test-click-id",
    "timestamp": "2024-01-01T00:00:00Z"
  }'
```

For proposal payment links, fetch or construct a valid proposal ID and then call:

```bash
curl -i "https://your-cloudflare-domain.com/api/proposals/REAL_PROPOSAL_ID/payment-link"
```

If any of these routes return non-2xx responses or unexpected payloads, inspect Cloudflare logs:

- **Pages** → Functions / logs for the project.
- **Workers** → Logs / tail for any Worker-based endpoints.

Cloudflare logging is often the fastest way to see Edge-specific errors (for example, missing environment variables or unsupported Node APIs).

### Stripe & Reddit-specific checks

Some flows are intentionally kept on the Node runtime and are documented in more detail in [`docs/edge-compatibility.md`](docs/edge-compatibility.md:1).

- **Stripe (test mode):**
  - Use Stripe test API keys and the documented webhook/checkout endpoints to exercise payment flows.
  - Confirm that:
    - Checkout sessions can be created.
    - Webhooks are received and processed without errors.
    - Any proposal/credit updates triggered by Stripe events work end-to-end.

- **Reddit Conversions API:**
  - Send a controlled test event via the `reddit-conversion` API as shown above.
  - Monitor:
    - Cloudflare logs for request/response details.
    - Reddit Ads dashboard / event logs (depending on Reddit’s UI) to confirm that test events arrive.

For more details on runtime boundaries and which routes are Node-only vs Edge, see [`docs/edge-compatibility.md`](docs/edge-compatibility.md:1).