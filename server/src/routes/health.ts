import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'

export const healthRouter = Router()

healthRouter.get('/', async (_req: Request, res: Response) => {
  let dbStatus = 'configured (not yet connected)'

  // If DATABASE_URL is provided, attempt quick ping
  if (process.env.DATABASE_URL) {
    try {
      await prisma.$queryRaw`SELECT 1`
      dbStatus = 'connected'
    } catch {
      dbStatus = 'connection error (check DATABASE_URL / Supabase credentials)'
    }
  }

  res.json({
    status: 'ok',
    message: 'Backend server is running smoothly!',
    timestamp: new Date().toISOString(),
    services: {
      server: 'healthy',
      database: dbStatus,
    },
  })
})

