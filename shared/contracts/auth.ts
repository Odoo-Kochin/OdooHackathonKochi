import { z } from 'zod'

// ============================================================================
// AUTH & ROLE SCHEMAS
// ============================================================================

export const UserRoleSchema = z.enum(['admin', 'staff', 'customer'])
export type UserRole = z.infer<typeof UserRoleSchema>

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
  company: z.string().optional(),
  avatarUrl: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type AuthUser = z.infer<typeof AuthUserSchema>

// Password validation rule per Brightloop requirements:
// > 8 chars, uppercase, lowercase, and special character
export const PasswordSchema = z
  .string()
  .min(9, 'Password must be more than 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character')

export const LoginRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const RegisterRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: PasswordSchema,
  company: z.string().min(2, 'Company name is required').optional(),
  role: UserRoleSchema.default('customer'),
})

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

export const QuickLoginRequestSchema = z.object({
  role: UserRoleSchema,
})

export type QuickLoginRequest = z.infer<typeof QuickLoginRequestSchema>

export const ResetPasswordRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  token: z.string().optional(),
  user: AuthUserSchema.optional(),
  message: z.string().optional(),
})

export type AuthResponse = z.infer<typeof AuthResponseSchema>

// ============================================================================
// CANONICAL MOCK USERS & ROLES (Brightloop Software Team & Clients)
// ============================================================================

export const MOCK_AUTH_USERS: Record<UserRole, AuthUser> = {
  admin: {
    id: '11111111-1111-4111-a111-111111111111',
    email: 'admin@brightloop.io',
    name: 'Alex Rivera',
    role: 'admin',
    company: 'Brightloop Software HQ',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: '2026-10-01T08:00:00.000Z',
    updatedAt: '2026-10-31T10:00:00.000Z',
  },
  staff: {
    id: '22222222-2222-4222-a222-222222222222',
    email: 'staff@brightloop.io',
    name: 'Sarah Chen',
    role: 'staff',
    company: 'Brightloop Operations & Sales',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: '2026-10-05T09:30:00.000Z',
    updatedAt: '2026-10-31T10:00:00.000Z',
  },
  customer: {
    id: '33333333-3333-4333-a333-333333333333',
    email: 'david@acmeretail.com',
    name: 'David Miller',
    role: 'customer',
    company: 'Acme Retail & Logistics',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: '2026-10-12T14:15:00.000Z',
    updatedAt: '2026-10-31T10:00:00.000Z',
  },
}
