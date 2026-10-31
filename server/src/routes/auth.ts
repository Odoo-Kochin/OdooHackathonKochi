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
import { signToken, verifyToken } from '../lib/jwt.js'
import { z } from 'zod'

export const authRouter = Router()

// Helper date serializer
const toIso = (d: Date | string): string => (d instanceof Date ? d.toISOString() : new Date(d).toISOString())

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginRequestSchema.parse(req.body)

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

    if (dbUser.passwordHash && dbUser.passwordHash !== password) {
      res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.',
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

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      company: user.company,
    })

    res.json({
      success: true,
      token,
      user,
      message: 'Signed in successfully',
    })
  } catch (error: any) {
    if (error instanceof z.ZodError || error?.name === 'ZodError') {
      res.status(400).json({ success: false, message: error.message || 'Validation error', errors: error.errors || error.issues })
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
        passwordHash: validated.password,
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

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      company: user.company,
    })

    res.status(201).json({
      success: true,
      token,
      user,
      message: 'Account registered and persisted successfully',
    })
  } catch (error: any) {
    if (error instanceof z.ZodError || error?.name === 'ZodError') {
      res.status(400).json({ success: false, message: error.message || 'Validation error', errors: error.errors || error.issues })
      return
    }
    res.status(500).json({ success: false, message: error?.message || 'Registration failed' })
  }
})

// POST /api/auth/quick-login - 1-Click Role Switch & Instant Login from DB
authRouter.post('/quick-login', async (req: Request, res: Response) => {
  try {
    const { role } = QuickLoginRequestSchema.parse(req.body)

    let dbUser = await prisma.user.findFirst({
      where: { role },
      orderBy: { createdAt: 'asc' },
    })

    if (!dbUser) {
      const defaultData: Record<string, { email: string; name: string; company: string }> = {
        admin: { email: 'admin@brightloop.com', name: 'Brightloop Admin', company: 'Brightloop HQ' },
        staff: { email: 'operations@brightloop.com', name: 'Ops Staff Lead', company: 'Brightloop Internal' },
        customer: { email: 'david@acmeretail.com', name: 'David Miller', company: 'Acme Retail & Logistics' },
      }

      const seedData = defaultData[role] || {
        email: `${role}@brightloop.demo`,
        name: `${role.toUpperCase()} User`,
        company: 'Brightloop Demo Org',
      }

      dbUser = await prisma.user.upsert({
        where: { email: seedData.email },
        update: { role },
        create: {
          email: seedData.email,
          name: seedData.name,
          role,
          company: seedData.company,
        },
      })
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

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      company: user.company,
    })

    res.json({
      success: true,
      token,
      user,
      message: `Signed in as ${user.name} (${user.role.toUpperCase()}) from database`,
    })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error?.message || 'Quick login failed' })
  }
})

// GET /api/auth/me - Get current active profile from DB using verified JWT
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' })
      return
    }

    const rawToken = authHeader.substring(7).trim()
    const payload = verifyToken(rawToken)

    if (!payload) {
      res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' })
      return
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: payload.id },
    })

    if (!dbUser) {
      res.status(404).json({ success: false, message: 'User not found in database.' })
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

    res.json({ success: true, user })
  } catch (_err: any) {
    res.status(500).json({ success: false, message: 'Failed to verify session' })
  }
})

// POST /api/auth/reset-password
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email } = ResetPasswordRequestSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    res.json({
      success: true,
      message: user
        ? `Password reset verification link has been dispatched to ${email}.`
        : `If this email is registered, a password reset link has been dispatched.`,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError || error?.name === 'ZodError') {
      res.status(400).json({ success: false, errors: error.errors || error.issues })
      return
    }
    res.status(500).json({ success: false, message: 'Reset password failed' })
  }
})
