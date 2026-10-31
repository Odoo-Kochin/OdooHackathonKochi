import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import {
  CreateUserRequestSchema,
  MOCK_USERS,
  type User,
} from '@shared/contracts/users.js'
import { z } from 'zod'

export const usersRouter = Router()

// Toggle to return contract mock data when database is pending or offline
const USE_MOCKS = process.env.USE_MOCKS === 'true'

// In-memory mock store for mock mutations during development
let mockStore: User[] = [...MOCK_USERS]

// GET /api/users - List users
usersRouter.get('/', async (_req: Request, res: Response) => {
  if (USE_MOCKS) {
    res.json({
      success: true,
      data: mockStore,
      message: 'Serving mock data (USE_MOCKS=true)',
    })
    return
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Format dates to ISO string to strictly match contract
    const formatted = users.map((u: any) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }))

    res.json({ success: true, data: formatted })
  } catch (error: any) {
    console.error('Database error fetching users:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users from database',
      error: error?.message,
    })
  }
})

// POST /api/users - Create user
usersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = CreateUserRequestSchema.parse(req.body)

    if (USE_MOCKS) {
      const mockCreatedUser: User = {
        id: crypto.randomUUID(),
        email: validatedData.email,
        name: validatedData.name ?? null,
        role: validatedData.role ?? 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockStore.unshift(mockCreatedUser)
      res.status(201).json({ success: true, data: mockCreatedUser })
      return
    }

    const user = await prisma.user.create({
      data: validatedData,
    })

    res.status(201).json({
      success: true,
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.errors })
      return
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error?.message || 'Internal server error',
    })
  }
})
