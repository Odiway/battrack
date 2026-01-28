import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { neonConfig, Pool } from '@neondatabase/serverless'
import pg from 'pg'

// Store pool and client globally to avoid recreating on each request
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | pg.Pool | undefined
}

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable'
const isNeon = connectionString.includes('neon.tech')

// Configure for Neon serverless
if (isNeon) {
  neonConfig.useSecureWebSocket = true
  neonConfig.pipelineTLS = false
  neonConfig.pipelineConnect = false
}

if (!globalForPrisma.pool) {
  if (isNeon) {
    // Use Neon serverless pool for production
    globalForPrisma.pool = new Pool({ connectionString })
  } else {
    // Use pg pool for local development
    globalForPrisma.pool = new pg.Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 10000,
    })
  }
}

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg(globalForPrisma.pool as pg.Pool)
  globalForPrisma.prisma = new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma
