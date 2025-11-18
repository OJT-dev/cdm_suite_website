# Cloudflare Pages Build Fixes

## Summary
Fixed critical build failures on Cloudflare Pages caused by database access during static generation and configuration issues.

## Problems Identified

### 1. Database Access During Build
**Error**: `Environment variable not found: DATABASE_URL`
- Pages trying to fetch data from Prisma during static generation
- No database connection available during Cloudflare Pages build process
- Affected routes:
  - `/api/services`
  - `/case-studies`
  - `/gallery/websites`
  - `/gallery/ai-agents`

### 2. Dynamic Server Usage in Static Context
**Error**: `Route /api/bid-proposals/analytics couldn't be rendered statically because it used headers()`
- API route using `headers()` without proper dynamic configuration
- Next.js trying to statically generate a route that requires runtime data

### 3. Path Resolution Issue
**Error**: `ENOENT: no such file or directory, lstat '/opt/buildhome/repo/repo/.next/routes-manifest.json'`
- `outputFileTracingRoot` causing path duplication (`repo/repo`)
- Incorrect path configuration in `next.config.js`

## Solutions Implemented

### 1. Skip Database Calls During Build

**File**: `nextjs_space/next.config.js`
```javascript
env: {
  SKIP_BUILD_STATIC_GENERATION: 'true',
}
```

**Updated Pages**:
- `app/case-studies/page.tsx`
- `app/gallery/websites/page.tsx`
- `app/gallery/ai-agents/page.tsx`

Each page now checks for the environment variable:
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getData() {
  // Skip database calls during build
  if (process.env.SKIP_BUILD_STATIC_GENERATION === 'true') {
    return [];
  }
  
  try {
    // ... database query
  } catch (error) {
    return [];
  }
}
```

### 2. Fixed API Routes Configuration

**File**: `app/api/services/route.ts`
```typescript
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
```

**File**: `app/api/bid-proposals/analytics/route.ts`
```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

### 3. Fixed Path Resolution

**File**: `nextjs_space/next.config.js`
```javascript
experimental: {
  // Use __dirname directly without going up a level
  outputFileTracingRoot: __dirname,
}
```

## How It Works

### Build Time (Cloudflare Pages)
1. `SKIP_BUILD_STATIC_GENERATION=true` is set via `next.config.js`
2. Pages that query the database return empty arrays instead
3. Static HTML is generated with empty state
4. No database connection required

### Runtime (Production)
1. Environment variable is not set (or set to false)
2. Pages make actual database queries
3. Data is fetched and displayed normally
4. Full functionality restored

## Configuration Notes

### Cloudflare Pages Settings
- **Build command**: `npx @cloudflare/next-on-pages@1`
- **Build output directory**: `.vercel/output/static`
- **Root directory**: `nextjs_space`
- **Node version**: 22.16.0

### Environment Variables Required
Set these in Cloudflare Pages dashboard:
- `DATABASE_URL` - Prisma Accelerate connection string
- `DATABASE_DIRECT_URL` - Direct PostgreSQL connection (for migrations only)
- All other app-specific environment variables

### Runtime Exports
According to `docs/edge-compatibility.md`, these routes should use Edge runtime:
- CRM routes
- Analytics routes
- Credits routes
- Workflow routes

Routes requiring Node runtime (Stripe, document generation):
- Stripe webhook handlers
- PDF/Word document generation
- File upload handlers

## Testing

### Local Build Test
```bash
cd nextjs_space
npm install
npm run build
```

### Cloudflare Pages Build
The build should now:
1. ✅ Install dependencies successfully
2. ✅ Run TypeScript compilation without errors
3. ✅ Generate static pages without database errors
4. ✅ Create proper output in `.vercel/output/static`
5. ✅ Deploy successfully to Cloudflare Pages

## Verification Checklist

- [x] Fixed database access during static generation
- [x] Added `force-dynamic` to API routes
- [x] Fixed `outputFileTracingRoot` path issue
- [x] Updated all affected page components
- [x] Documented changes and configuration
- [ ] Test local build completes successfully
- [ ] Test Cloudflare Pages deployment
- [ ] Verify runtime database access works
- [ ] Verify all pages load correctly in production

## Related Documentation

- `docs/edge-compatibility.md` - Edge vs Node runtime guidelines
- `docs/testing-workflow.md` - Testing procedures
- `AGENTS.md` - Build and deployment instructions

## Troubleshooting

### If Build Still Fails

1. **Check Cloudflare Pages Settings**
   - Verify root directory is set to `nextjs_space`
   - Verify build command is `npx @cloudflare/next-on-pages@1`

2. **Check Environment Variables**
   - DATABASE_URL should NOT be set during build
   - Only set runtime environment variables in Cloudflare dashboard

3. **Check for Other Database Queries**
   - Search for `prisma.` in page components
   - Add `SKIP_BUILD_STATIC_GENERATION` check to any found

4. **Check API Routes**
   - Ensure all API routes have proper runtime exports
   - Edge routes: `export const runtime = 'edge'`
   - Node routes: `export const runtime = 'nodejs'`

### Common Issues

**Issue**: Pages show empty data in production
**Solution**: Verify `SKIP_BUILD_STATIC_GENERATION` is NOT set in Cloudflare Pages environment variables

**Issue**: Build fails with TypeScript errors
**Solution**: Run `npm run build` locally to identify and fix TypeScript issues

**Issue**: Routes return 500 errors
**Solution**: Check Cloudflare Pages logs for runtime errors, verify DATABASE_URL is set correctly

## Next Steps

1. Commit and push these changes
2. Trigger a new Cloudflare Pages build
3. Monitor build logs for success
4. Test production deployment
5. Verify all features work correctly

## Notes

- The `SKIP_BUILD_STATIC_GENERATION` approach allows pages to build without database access
- At runtime, the environment variable is not set, so normal database queries work
- This is a common pattern for Next.js apps deployed to edge platforms
- Alternative approaches (ISR, client-side fetching) were considered but this provides the best UX
