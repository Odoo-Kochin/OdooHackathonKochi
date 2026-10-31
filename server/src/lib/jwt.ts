import jwt, { type SignOptions } from 'jsonwebtoken'
import type { UserRole } from '@shared/contracts/auth.js'

export interface JwtTokenPayload {
  id: string
  email: string
  role: UserRole
  name?: string
  company?: string
}

const JWT_SECRET: string =
  process.env.JWT_SECRET || 'brightloop-super-secret-jwt-key-2026'

const DEFAULT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d'

/**
 * Signs a payload into a cryptographically secure JSON Web Token (JWT).
 */
export function signToken(
  payload: JwtTokenPayload,
  expiresIn: string = DEFAULT_EXPIRES_IN
): string {
  const options: SignOptions = {
    expiresIn: expiresIn as any,
  }
  return jwt.sign(payload, JWT_SECRET, options)
}

/**
 * Verifies a JWT string using the server secret key.
 * Returns the decoded payload if valid and unexpired; otherwise null.
 */
export function verifyToken(token: string): JwtTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtTokenPayload
    if (decoded && typeof decoded === 'object' && decoded.id && decoded.email) {
      return decoded
    }
    return null
  } catch (_err) {
    return null
  }
}

