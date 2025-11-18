# Edge Compatibility Overview

This document summarizes which parts of the CDM Suite Next.js app are ready for the Cloudflare Edge runtime and which currently require the Node.js runtime.

## 1. Edge-ready routes (runtime "edge")

These routes are explicitly configured to run on the Edge runtime and use only Web APIs, the shared Edge Prisma client, and Edge-safe helpers.

- [`app/api/crm/stats/route.ts`](cdm_suite_website/nextjs_space/app/api/crm/stats/route.ts:1)
- [`app/api/crm/leads/route.ts`](cdm_suite_website/nextjs_space/app/api/crm/leads/route.ts:1)
- [`app/api/crm/leads/[id]/route.ts`](cdm_suite_website/nextjs_space/app/api/crm/leads/[id]/route.ts:1)
- [`app/api/crm/sequences/route.ts`](cdm_suite_website/nextjs_space/app/api/crm/sequences/route.ts:1)
- [`app/api/crm/sequences/[id]/route.ts`](cdm_suite_website/nextjs_space/app/api/crm/sequences/[id]/route.ts:1)
- [`app/api/team/workload/route.ts`](cdm_suite_website/nextjs_space/app/api/team/workload/route.ts:1)
- [`app/api/workflows/[id]/tasks/route.ts`](cdm_suite_website/nextjs_space/app/api/workflows/[id]/tasks/route.ts:1)
- [`app/api/workflows/[id]/assign-team/route.ts`](cdm_suite_website/nextjs_space/app/api/workflows/[id]/assign-team/route.ts:1)
- [`app/api/credits/route.ts`](cdm_suite_website/nextjs_space/app/api/credits/route.ts:1)
- [`app/api/affiliate/route.ts`](cdm_suite_website/nextjs_space/app/api/affiliate/route.ts:1)
- [`app/api/bid-proposals/analytics/route.ts`](cdm_suite_website/nextjs_space/app/api/bid-proposals/analytics/route.ts:1)
- [`app/api/bid-proposals/reminders/route.ts`](cdm_suite_website/nextjs_space/app/api/bid-proposals/reminders/route.ts:1)
- [`app/api/proposals/[id]/payment-link/route.ts`](cdm_suite_website/nextjs_space/app/api/proposals/[id]/payment-link/route.ts:1)
- [`app/api/analytics/reddit-conversion/route.ts`](cdm_suite_website/nextjs_space/app/api/analytics/reddit-conversion/route.ts:1)

_Note: This list is focused on core CRM, workflow, credits, affiliate, bid-proposals, and analytics routes that have already been migrated. Additional AI, builder, and content routes may also be Edge-ready but are not exhaustively cataloged here yet._

## 2. Node-only (Stripe)

These routes import the Stripe Node SDK directly or indirectly via [`lib/stripe.ts`](cdm_suite_website/nextjs_space/lib/stripe.ts:2) and therefore require the Node.js runtime today.

- [`app/api/stripe-webhook/route.ts`](cdm_suite_website/nextjs_space/app/api/stripe-webhook/route.ts:2)
  - Uses [`getStripeInstance()`](cdm_suite_website/nextjs_space/lib/stripe.ts:5) and Stripe webhook signature verification to construct events, then updates orders and tracks Reddit conversions.
- [`app/api/webhooks/stripe/route.ts`](cdm_suite_website/nextjs_space/app/api/webhooks/stripe/route.ts:2)
  - Uses [`getStripeInstance()`](cdm_suite_website/nextjs_space/lib/stripe.ts:5) and multiple Stripe event types for checkout sessions, subscriptions, invoices, and payment recovery, and creates workflows from successful orders.
- [`app/api/webhook/stripe/route.ts`](cdm_suite_website/nextjs_space/app/api/webhook/stripe/route.ts:2)
  - Imports [`getStripeInstance()`](cdm_suite_website/nextjs_space/lib/stripe.ts:5) and `Stripe.Event`; currently parses the body as JSON but is designed as a Stripe webhook handler.
- [`app/api/subscription/create-checkout/route.ts`](cdm_suite_website/nextjs_space/app/api/subscription/create-checkout/route.ts:2)
  - Calls [`getStripeInstance()`](cdm_suite_website/nextjs_space/lib/stripe.ts:5) to create subscription Checkout Sessions for SaaS tiers.
- [`app/api/create-checkout-session/route.ts`](cdm_suite_website/nextjs_space/app/api/create-checkout-session/route.ts:2)
  - Uses [`getStripeInstance()`](cdm_suite_website/nextjs_space/lib/stripe.ts:5) to create one-time or subscription Checkout Sessions for catalog services.
- [`app/api/create-tripwire-checkout/route.ts`](cdm_suite_website/nextjs_space/app/api/create-tripwire-checkout/route.ts:2)
  - Uses [`getStripeInstance()`](cdm_suite_website/nextjs_space/lib/stripe.ts:5) to create Checkout Sessions for marketing "tripwire" offers (GET links and POST API).
- [`app/api/checkout/website-fix/route.ts`](cdm_suite_website/nextjs_space/app/api/checkout/website-fix/route.ts:3)
  - Instantiates the Stripe SDK directly with `new Stripe(...)` for the Website Fix flow and creates Checkout Sessions.
- [`app/api/credits/purchase/route.ts`](cdm_suite_website/nextjs_space/app/api/credits/purchase/route.ts:5)
  - Uses the Stripe Node SDK to sell credit packages via Checkout Sessions. Already includes an inline note that it requires the Node runtime.
- [`app/api/proposals/route.ts`](cdm_suite_website/nextjs_space/app/api/proposals/route.ts:2)
  - Uses `new Stripe(...)` to create products, prices, and payment links when creating proposals.
- [`app/api/proposals/[id]/route.ts`](cdm_suite_website/nextjs_space/app/api/proposals/[id]/route.ts:2)
  - Uses `new Stripe(...)` to deactivate and recreate payment links when a proposal total changes.
- [`app/api/get-stripe-key/route.ts`](cdm_suite_website/nextjs_space/app/api/get-stripe-key/route.ts:2)
  - Calls [`getStripePublishableKey()`](cdm_suite_website/nextjs_space/lib/stripe.ts:22) from the shared Stripe helper module; this helper throws on the client and reads Stripe env vars on the server.

Key helper module:

- [`lib/stripe.ts`](cdm_suite_website/nextjs_space/lib/stripe.ts:2)
  - Wraps `new Stripe(secretKey, { apiVersion: '2025-10-29.clover' })` in [`getStripeInstance()`](cdm_suite_website/nextjs_space/lib/stripe.ts:5) and exposes [`getStripePublishableKey()`](cdm_suite_website/nextjs_space/lib/stripe.ts:22) plus `PRICING_PACKAGES` metadata.

### Potential Stripe refactor approach

- Replace most Stripe Node SDK calls (products, prices, payment links, Checkout Sessions) with `fetch` requests to `https://api.stripe.com/v1/...` using the Edge runtime, following the pattern already used in [`app/api/proposals/[id]/payment-link/route.ts`](cdm_suite_website/nextjs_space/app/api/proposals/[id]/payment-link/route.ts:45).
- Keep webhook verification on Node for now, or evaluate Stripe's guidance for running webhook verification safely on Cloudflare Workers.
- Move simple env-key helpers like [`getStripePublishableKey()`](cdm_suite_website/nextjs_space/lib/stripe.ts:22) into an Edge-safe module that does not import the Stripe SDK, so endpoints like [`app/api/get-stripe-key/route.ts`](cdm_suite_website/nextjs_space/app/api/get-stripe-key/route.ts:2) can eventually run on Edge.

## 3. Node-only (file I/O, PDFs, Word, and other heavy libs)

These routes and libraries perform heavy document generation using Node-oriented packages (for example `docx` and `pdf-lib`) and operate on binary buffers. They are natural candidates to remain on Node or be offloaded to R2 or external services.

Routes:

- [`app/api/bid-proposals/[id]/download-word/route.ts`](cdm_suite_website/nextjs_space/app/api/bid-proposals/[id]/download-word/route.ts:1)
  - Generates `.docx` files via [`generateWordDocument()`](cdm_suite_website/nextjs_space/lib/docx-generator.ts:42) and streams them back as an attachment.
- [`app/api/bid-proposals/[id]/documents/combined/route.ts`](cdm_suite_website/nextjs_space/app/api/bid-proposals/[id]/documents/combined/route.ts:1)
  - Uses `PDFDocument` from `pdf-lib` and [`generateProposalPDF()`](cdm_suite_website/nextjs_space/lib/pdf-generator.ts:124) to build a combined PDF from multiple bid documents.
- [`app/api/proposals/[id]/pdf/route.ts`](cdm_suite_website/nextjs_space/app/api/proposals/[id]/pdf/route.ts:7)
  - Currently returns HTML for a proposal. The comments indicate it is intended to be backed by a PDF generation service, and it also uses server-side NextAuth session helpers, which are Node-only in this setup.

Supporting libraries:

- [`lib/docx-generator.ts`](cdm_suite_website/nextjs_space/lib/docx-generator.ts:1)
  - Uses the `docx` library to construct Word documents with headings, paragraphs, and sections. Returns a Node `Buffer`, which is not available in the Cloudflare Edge runtime.
- [`lib/pdf-generator.ts`](cdm_suite_website/nextjs_space/lib/pdf-generator.ts:1)
  - Uses `pdf-lib` extensively (manual layout, tables, TOC, and multi-page rendering). Returns a Node `Buffer` and relies on [`getContactInfo()`](cdm_suite_website/nextjs_space/lib/pdf-generator.ts:272) from the CDM Suite knowledge module. Designed for Node, not Edge.

### Potential refactor approach for document routes

- Move heavy PDF and Word generation to a dedicated Node worker, background job, or external service, and have Edge routes request pre-generated binaries from R2 or another object store.
- For PDFs, explore `pdf-lib` in a pure Web Streams / `Uint8Array` mode or use a Cloudflare Worker-compatible PDF service. Replace `Buffer` usage in [`lib/pdf-generator.ts`](cdm_suite_website/nextjs_space/lib/pdf-generator.ts:124) with Edge-safe types if feasible.
- For Word documents, either keep [`lib/docx-generator.ts`](cdm_suite_website/nextjs_space/lib/docx-generator.ts:42) on Node or investigate Worker-compatible Office document generation libraries.

## 4. Mixed / candidates for future Edge refactor

These routes are not currently Edge-configured but could plausibly be moved with targeted changes.

- [`app/api/get-stripe-key/route.ts`](cdm_suite_website/nextjs_space/app/api/get-stripe-key/route.ts:2)
  - Only needs to read the publishable key from env and return JSON. If [`getStripePublishableKey()`](cdm_suite_website/nextjs_space/lib/stripe.ts:22) is split into an Edge-safe helper that does not import the Stripe SDK, this route can be marked as Edge runtime.
- [`app/api/proposals/[id]/pdf/route.ts`](cdm_suite_website/nextjs_space/app/api/proposals/[id]/pdf/route.ts:7)
  - Today just generates HTML. An Edge-ready version could keep the HTML generation on Edge and delegate the actual PDF conversion to the client or an R2-backed job.
- Stripe checkout creation routes such as [`app/api/create-checkout-session/route.ts`](cdm_suite_website/nextjs_space/app/api/create-checkout-session/route.ts:6), [`app/api/create-tripwire-checkout/route.ts`](cdm_suite_website/nextjs_space/app/api/create-tripwire-checkout/route.ts:74), and [`app/api/subscription/create-checkout/route.ts`](cdm_suite_website/nextjs_space/app/api/subscription/create-checkout/route.ts:28)
  - These are logically simple wrappers around Checkout Session creation. They are strong candidates to be migrated to Edge once Stripe calls are rewritten to use `fetch` instead of the Node SDK.

## 5. Summary

- Edge is already used for a wide set of CRM, workflows, credits, affiliate, analytics, and proposal payment-link routes built on the Edge Prisma client.
- Stripe-heavy routes and document-generation endpoints are the primary Node-only areas today.
- The cleanest migration path is:
  - (a) adopt the Stripe Web API pattern already used in [`app/api/proposals/[id]/payment-link/route.ts`](cdm_suite_website/nextjs_space/app/api/proposals/[id]/payment-link/route.ts:45) across checkout and proposal routes, and
  - (b) move PDF and Word generation behind R2 or other Worker-compatible workflows.
- Once those changes land, the remaining Node-only surface can be limited to true webhooks and any high-complexity PDF or Office generation that is impractical to port to Edge.