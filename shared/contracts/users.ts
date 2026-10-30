import { z } from 'zod'

// ============================================================================
// USER SCHEMAS & CONTRACTS
// ============================================================================

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  role: z.enum(['admin', 'user']).default('user'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type User = z.infer<typeof UserSchema>

export const CreateUserRequestSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'user']).optional().default('user'),
})

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>

export const UserListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(UserSchema),
  message: z.string().optional(),
})

export type UserListResponse = z.infer<typeof UserListResponseSchema>

export const UserDetailResponseSchema = z.object({
  success: z.boolean(),
  data: UserSchema,
  message: z.string().optional(),
})

export type UserDetailResponse = z.infer<typeof UserDetailResponseSchema>

// ============================================================================
// CANONICAL MOCK DATA
// Used by Express backend mock handlers and frontend mock testing
// ============================================================================

export const MOCK_USERS: User[] = [
  {
    id: 'e2b3c4d5-6789-4abc-9def-0123456789ab',
    email: 'alex.hackathon@odoo.com',
    name: 'Alex Rivera',
    role: 'admin',
    createdAt: '2026-10-30T10:00:00.000Z',
    updatedAt: '2026-10-30T10:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-5678-490a-bcde-f12345678901',
    email: 'sarah.dev@odoo.com',
    name: 'Sarah Chen',
    role: 'user',
    createdAt: '2026-10-30T11:30:00.000Z',
    updatedAt: '2026-10-30T11:30:00.000Z',
  },
]

