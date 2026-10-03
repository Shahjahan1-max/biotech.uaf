import type { Request, Response, NextFunction } from 'express'
import { getSessionUser } from '../services/authService.js'

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string }
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getSessionUser()
    if (!user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }
    req.user = { id: user.id, role: user.role }
    next()
  } catch {
    res.status(503).json({ error: 'Unable to load your account. Please try again.' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' })
      return
    }

    next()
  }
}
