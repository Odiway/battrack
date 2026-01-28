import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

// Global store for prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Get DATABASE_URL at runtime, not build time
  const databaseUrl = process.env.DATABASE_URL
  
  console.log('DATABASE_URL exists:', !!databaseUrl)
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables')
  }
  
  // Create Prisma adapter for Neon with connection string
  const adapter = new PrismaNeon({ connectionString: databaseUrl })
  
  // Create and return Prisma client with adapter
  return new PrismaClient({ adapter })
}

// Export a function that returns the client (ensures runtime evaluation)
function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

// Export as getter to ensure lazy evaluation
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return getPrismaClient()[prop as keyof PrismaClient]
  }
})
