import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'

// Load server/.env reliably whether started from root or server directory
dotenv.config({ path: path.resolve(import.meta.dirname, '../.env') })
dotenv.config()

import { healthRouter } from './routes/health.js'
import { usersRouter } from './routes/users.js'
import { authRouter } from './routes/auth.js'
import { subscriptionsRouter } from './routes/subscriptions.js'
import { seedDatabaseIfEmpty } from './lib/seed.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
)
app.use(express.json())

// API Routes
app.use('/api/health', healthRouter)
app.use('/api/users', usersRouter)
app.use('/api/auth', authRouter)
app.use('/api', subscriptionsRouter)

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, async () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`)
  await seedDatabaseIfEmpty()
})
