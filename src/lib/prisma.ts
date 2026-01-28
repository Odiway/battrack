import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { neonConfig, Pool as NeonPool } from '@neondatabase/serverless'
import { Pool as PgPool } from 'pg'
import ws from 'ws'

// Store pool and client globally to avoid recreating on each request
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: NeonPool | PgPool | undefined
}

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable'
const isNeon = connectionString.includes('neon.tech')

// Configure WebSocket for Neon serverless (required for Node.js environment)
if (isNeon && typeof globalThis.WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws
}

if (!globalForPrisma.pool) {
  if (isNeon) {
    // Use Neon serverless pool for production
    globalForPrisma.pool = new NeonPool({ connectionString })
  } else {
    // Use pg pool for local development
    globalForPrisma.pool = new PgPool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 10000,
    })
  }
}

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg(globalForPrisma.pool as PgPool)
  globalForPrisma.prisma = new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma
