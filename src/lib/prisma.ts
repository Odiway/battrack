import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Store pool and client globally to avoid recreating on each request
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: pg.Pool | undefined
}

const isProduction = process.env.NODE_ENV === 'production'

// Connection string based on environment
const connectionString = isProduction
  ? process.env.DATABASE_URL! // Neon DB connection string
  : 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable'

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new pg.Pool({
    connectionString,
    max: isProduction ? 10 : 1,
    idleTimeoutMillis: isProduction ? 30000 : 0,
    connectionTimeoutMillis: 10000,
    ssl: isProduction ? { rejectUnauthorized: true } : undefined,
  })
}

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg(globalForPrisma.pool)
  globalForPrisma.prisma = new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma
