# Architecture Overview

This document summarizes the high-level architecture of the CDM Suite:

- Next.js app: `cdm_suite_website/nextjs_space`
- Database: PostgreSQL via Prisma + Prisma Accelerate / Data Proxy
- Deployment target: Cloudflare Pages + Workers (Edge runtime)
- Major domains:
  - CRM & sequences
  - Proposals & bid management
  - AI-assisted tools
  - Analytics, tracking, and reporting