import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { neonConfig, Pool as NeonPool } from '@neondatabase/serverless'
import { Pool as PgPool } from 'pg'

// Store pool and client globally to avoid recreating on each request
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: NeonPool | PgPool | undefined
}

function getConnectionString(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is not set!')
    return 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable'
  }
  return url
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const connectionString = getConnectionString()
  const isNeon = connectionString.includes('neon.tech')

  // Configure WebSocket for Neon serverless
  if (isNeon) {
    neonConfig.useSecureWebSocket = true
    
    // Only set WebSocket constructor in Node.js environment
    if (typeof globalThis.WebSocket === 'undefined' && typeof process !== 'undefined') {
      try {
        const ws = require('ws')
        neonConfig.webSocketConstructor = ws
      } catch {
        // ws not available, will use fetch
      }
    }
  }

  if (!globalForPrisma.pool) {
    if (isNeon) {
      globalForPrisma.pool = new NeonPool({ connectionString })
    } else {
      globalForPrisma.pool = new PgPool({
        connectionString,
        max: 1,
        idleTimeoutMillis: 0,
        connectionTimeoutMillis: 10000,
      })
    }
  }

  const adapter = new PrismaPg(globalForPrisma.pool as PgPool)
  globalForPrisma.prisma = new PrismaClient({ adapter })
  
  return globalForPrisma.prisma
}

export const prisma = getPrismaClient()
