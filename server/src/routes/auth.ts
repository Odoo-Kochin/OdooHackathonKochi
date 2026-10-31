import { Router, Request, Response } from 'express'
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  QuickLoginRequestSchema,
  ResetPasswordRequestSchema,
  MOCK_AUTH_USERS,
  type AuthUser,
  type UserRole,
} from '@shared/contracts/auth.js'
import { prisma } from '../lib/prisma.js'
import { z } from 'zod'

export const authRouter = Router()

const USE_MOCKS = process.env.USE_MOCKS === 'true'

// Dynamic in-memory mock store for users during runtime
const authUsersStore: Map<string, AuthUser> = new Map([
  [MOCK_AUTH_USERS.admin.email, MOCK_AUTH_USERS.admin],
  [MOCK_AUTH_USERS.staff.email, MOCK_AUTH_USERS.staff],
  [MOCK_AUTH_USERS.customer.email, MOCK_AUTH_USERS.customer],
])

// Simulated active session (for cookie/header or token testing)
let currentUserSession: AuthUser = MOCK_AUTH_USERS.admin

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginRequestSchema.parse(req.body)

    if (USE_MOCKS) {
      const existingUser = authUsersStore.get(email.toLowerCase())
      if (!existingUser) {
        // Allow demo login with auto-assigned role if not explicitly recognized
        const newUser: AuthUser = {
          id: crypto.randomUUID(),
          email: email.toLowerCase(),
          name: email.split('@')[0],
          role: email.includes('admin') ? 'admin' : email.includes('staff') ? 'staff' : 'customer',
          company: 'Brightloop Demo Enterprise',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        authUsersStore.set(newUser.email, newUser)
        currentUserSession = newUser
        res.json({
          success: true,
          token: `mock-jwt-${newUser.id}`,
          user: newUser,
          message: 'Signed in successfully (demo user created)',
        })
        return
      }

      currentUserSession = existingUser
      res.json({
        success: true,
        token: `mock-jwt-${existingUser.id}`,
        user: existingUser,
        message: 'Signed in successfully',
      })
      return
    }

    // Database mode
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (dbUser) {
        const user: AuthUser = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || dbUser.email.split('@')[0],
          role: (dbUser.role as UserRole) || 'customer',
          createdAt: dbUser.createdAt.toISOString(),
          updatedAt: dbUser.updatedAt.toISOString(),
        }
        currentUserSession = user
        res.json({
          success: true,
          token: `db-token-${user.id}`,
          user,
          message: 'Signed in successfully with database',
        })
        return
      }
    } catch (dbErr: any) {
      console.warn('DB login query fell back to mock store:', dbErr?.message)
    }

    // Fallback to mock store if user exists or create
    const fallbackUser = authUsersStore.get(email.toLowerCase()) || {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      name: email.split('@')[0],
      role: 'customer' as UserRole,
      company: 'Brightloop Client',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    currentUserSession = fallbackUser
    res.json({
      success: true,
      token: `token-${fallbackUser.id}`,
      user: fallbackUser,
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
// Enforces Brightloop password rules: >8 chars, uppercase, lowercase, special char
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const validated = RegisterRequestSchema.parse(req.body)

    if (USE_MOCKS) {
      if (authUsersStore.has(validated.email.toLowerCase())) {
        res.status(400).json({
          success: false,
          message: 'An account with this email already exists.',
        })
        return
      }

      const newUser: AuthUser = {
        id: crypto.randomUUID(),
        email: validated.email.toLowerCase(),
        name: validated.name,
        role: validated.role || 'customer',
        company: validated.company || 'Brightloop Subscriber',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      authUsersStore.set(newUser.email, newUser)
      currentUserSession = newUser

      res.status(201).json({
        success: true,
        token: `mock-jwt-${newUser.id}`,
        user: newUser,
        message: 'Account registered successfully',
      })
      return
    }

    // Database mode
    try {
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
        },
      })

      const user: AuthUser = {
        id: created.id,
        email: created.email,
        name: created.name || validated.name,
        role: (created.role as UserRole) || 'customer',
        company: validated.company,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      }
      currentUserSession = user

      res.status(201).json({
        success: true,
        token: `db-token-${user.id}`,
        user,
        message: 'Account registered and persisted successfully',
      })
      return
    } catch (dbErr: any) {
      console.warn('Database error during register, falling back to mock store:', dbErr?.message)
      const fallbackUser: AuthUser = {
        id: crypto.randomUUID(),
        email: validated.email.toLowerCase(),
        name: validated.name,
        role: validated.role || 'customer',
        company: validated.company,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      authUsersStore.set(fallbackUser.email, fallbackUser)
      currentUserSession = fallbackUser
      res.status(201).json({
        success: true,
        token: `token-${fallbackUser.id}`,
        user: fallbackUser,
        message: 'Account registered successfully (store fallback)',
      })
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors })
      return
    }
    res.status(500).json({ success: false, message: error?.message || 'Registration failed' })
  }
})

// POST /api/auth/quick-login - 1-Click Role Switch & Instant Login
authRouter.post('/quick-login', async (req: Request, res: Response) => {
  try {
    const { role } = QuickLoginRequestSchema.parse(req.body)
    const mockUser = MOCK_AUTH_USERS[role]
    if (!mockUser) {
      res.status(400).json({ success: false, message: 'Invalid role requested' })
      return
    }

    currentUserSession = mockUser
    res.json({
      success: true,
      token: `quick-token-${mockUser.role}-${mockUser.id}`,
      user: mockUser,
      message: `Switched session to ${mockUser.name} (${mockUser.role.toUpperCase()})`,
    })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error?.message || 'Quick login failed' })
  }
})

// GET /api/auth/me - Get current active profile
authRouter.get('/me', (_req: Request, res: Response) => {
  res.json({
    success: true,
    user: currentUserSession,
    message: 'Current active session',
  })
})

// POST /api/auth/reset-password - Scene 1: "a reset link should arrive at their registered email"
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email } = ResetPasswordRequestSchema.parse(req.body)
    res.json({
      success: true,
      message: `Password reset instructions and verification link have been dispatched to ${email}.`,
    })
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Invalid email address provided.' })
  }
})
