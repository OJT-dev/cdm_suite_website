import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { D1Database } from '@cloudflare/workers-types'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  // Check if we are running in Cloudflare Workers/Pages
  if (process.env.NODE_ENV === 'production' && typeof process.env.DB !== 'undefined') {
    const adapter = new PrismaD1(process.env.DB as unknown as D1Database)
    return new PrismaClient({ adapter: adapter as any })
  }

  // Fallback for local development (standard SQLite)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
