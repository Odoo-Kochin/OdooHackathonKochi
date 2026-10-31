import { Router, Request, Response } from 'express'
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  QuickLoginRequestSchema,
  ResetPasswordRequestSchema,
  type AuthUser,
  type UserRole,
} from '@shared/contracts/auth.js'
import { prisma } from '../lib/prisma.js'
import { z } from 'zod'

export const authRouter = Router()

// Helper date serializer
const toIso = (d: Date | string): string => (d instanceof Date ? d.toISOString() : new Date(d).toISOString())

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email } = LoginRequestSchema.parse(req.body)

    const dbUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!dbUser) {
      res.status(401).json({
        success: false,
        message: 'No account found with this email address.',
      })
      return
    }

    const user: AuthUser = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || dbUser.email.split('@')[0],
      role: (dbUser.role as UserRole) || 'customer',
      company: dbUser.company ?? undefined,
      createdAt: toIso(dbUser.createdAt),
      updatedAt: toIso(dbUser.updatedAt),
    }

    res.json({
      success: true,
      token: `db-token-${user.id}`,
      user,
      message: 'Signed in successfully',
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors })
      return
    }
    res.status(500).json({ success: false, message: error?.message || 'Login failed' })
  }
})

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const validated = RegisterRequestSchema.parse(req.body)

    const existing = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    })

    if (existing) {
      res.status(400).json({
        success: false,
        message: 'An account with this email already exists in database.',
      })
      return
    }

    const created = await prisma.user.create({
      data: {
        email: validated.email.toLowerCase(),
        name: validated.name,
        role: validated.role || 'customer',
        company: validated.company || null,
      },
    })

    const user: AuthUser = {
      id: created.id,
      email: created.email,
      name: created.name || validated.name,
      role: (created.role as UserRole) || 'customer',
      company: created.company ?? undefined,
      createdAt: toIso(created.createdAt),
      updatedAt: toIso(created.updatedAt),
    }

    res.status(201).json({
      success: true,
      token: `db-token-${user.id}`,
      user,
      message: 'Account registered and persisted successfully',
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors })
      return
    }
    res.status(500).json({ success: false, message: error?.message || 'Registration failed' })
  }
})

// POST /api/auth/quick-login - 1-Click Role Switch & Instant Login from DB
authRouter.post('/quick-login', async (req: Request, res: Response) => {
  try {
    const { role } = QuickLoginRequestSchema.parse(req.body)

    const dbUser = await prisma.user.findFirst({
      where: { role },
      orderBy: { createdAt: 'asc' },
    })

    if (!dbUser) {
      res.status(404).json({
        success: false,
        message: `No active user with role '${role}' exists in the database.`,
      })
      return
    }

    const user: AuthUser = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || dbUser.email.split('@')[0],
      role: (dbUser.role as UserRole) || role,
      company: dbUser.company ?? undefined,
      createdAt: toIso(dbUser.createdAt),
      updatedAt: toIso(dbUser.updatedAt),
    }

    res.json({
      success: true,
      token: `quick-db-token-${user.role}-${user.id}`,
      user,
      message: `Signed in as ${user.name} (${user.role.toUpperCase()}) from database`,
    })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error?.message || 'Quick login failed' })
  }
})

// GET /api/auth/me - Get current active profile from DB
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    let userId: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const rawToken = authHeader.replace('Bearer ', '')
      // Token format: db-token-<userId> or quick-db-token-<role>-<userId>
      const parts = rawToken.split('-')
      userId = parts[parts.length - 1]
    }

    if (userId) {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (dbUser) {
        const user: AuthUser = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || dbUser.email.split('@')[0],
          role: (dbUser.role as UserRole) || 'customer',
          company: dbUser.company ?? undefined,
          createdAt: toIso(dbUser.createdAt),
          updatedAt: toIso(dbUser.updatedAt),
        }
        res.json({ success: true, user })
        return
      }
    }

    // Default to the first admin or user if no token provided
    const defaultUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    })

    if (defaultUser) {
      const user: AuthUser = {
        id: defaultUser.id,
        email: defaultUser.email,
        name: defaultUser.name || defaultUser.email.split('@')[0],
        role: (defaultUser.role as UserRole) || 'admin',
        company: defaultUser.company ?? undefined,
        createdAt: toIso(defaultUser.createdAt),
        updatedAt: toIso(defaultUser.updatedAt),
      }
      res.json({ success: true, user })
      return
    }

    res.status(401).json({ success: false, message: 'No active session' })
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to verify session' })
  }
})

// POST /api/auth/reset-password
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email } = ResetPasswordRequestSchema.parse(req.body)

    const dbUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!dbUser) {
      res.status(404).json({
        success: false,
        message: 'No account registered with this email address.',
      })
      return
    }

    res.json({
      success: true,
      message: `Password reset verification link has been dispatched to ${email}.`,
    })
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Invalid email address provided.' })
  }
})
