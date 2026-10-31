import { Request, Response, NextFunction } from 'express'
import { verifyToken, type JwtTokenPayload } from '../lib/jwt.js'
import type { UserRole } from '@shared/contracts/auth.js'

export interface AuthenticatedRequest extends Request {
  user?: JwtTokenPayload
}

/**
 * Middleware to strictly require a valid JWT Bearer token.
 */
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. No authorization token provided.',
    })
    return
  }

  const token = authHeader.substring(7).trim()
  const payload = verifyToken(token)

  if (!payload) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    })
    return
  }

  req.user = payload
  next()
}

/**
 * Middleware for optional token extraction without blocking unauthenticated requests.
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim()
    const payload = verifyToken(token)
    if (payload) {
      req.user = payload
    }
  }
  next()
}

/**
 * Middleware to enforce role-based access control (RBAC).
 * Requires `authenticateToken` to precede it in the middleware chain.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this action. Required: ${allowedRoles.join(', ')}`,
      })
      return
    }

    next()
  }
}

