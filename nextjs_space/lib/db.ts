import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Build-time protection: Completely skip Prisma initialization during static generation
const shouldSkipPrisma = process.env.NODE_ENV === 'production' && 
  process.env.SKIP_BUILD_STATIC_GENERATION === 'true'

if (shouldSkipPrisma) {
  // Create a dummy prisma client that won't make database calls
  globalForPrisma.prisma = {} as PrismaClient
}

export const prisma = shouldSkipPrisma 
  ? globalForPrisma.prisma as PrismaClient
  : globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://localhost:5432/db'
        }
      }
    })

if (process.env.NODE_ENV !== 'production' && !shouldSkipPrisma) {
  globalForPrisma.prisma = prisma
}
