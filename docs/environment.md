# Environment Configuration

This document outlines how environment variables are managed for CDM Suite.

## Local env files

- `.env.example` documents the required and optional environment variables.
- Create a `.env` file for local development based on `.env.example`.
- Keep real secrets (API keys, database credentials) out of version control.

## Database URLs

- `DATABASE_DIRECT_URL` – direct `postgresql://` connection string for migrations and CLI tools.
- `DATABASE_URL` – Prisma Accelerate / Data Proxy `prisma://` URL used by the edge runtime.

## Cloudflare secrets

- In production, environment variables should be configured in Cloudflare Pages / Workers.
- Do not rely on `.env` files in production.
- See `cdm_suite_website/nextjs_space/docs/cloudflare-deployment.md` for deployment-specific environment details.