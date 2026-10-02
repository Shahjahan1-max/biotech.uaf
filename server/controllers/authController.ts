import type { Request, Response } from 'express'
import * as authService from '../services/authService'
import { config } from '../config/env'
import { handleServiceError } from '../utils/handleServiceError'

const MAX_NAME_LENGTH = 100
const MAX_EMAIL_LENGTH = 254
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 128
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function cookieMaxAge(): number {
  const match = /^(\d+)\s*(s|m|h|d)$/i.exec(config.jwtExpiresIn.trim())
  if (!match) return 7 * 24 * 60 * 60 * 1000

  const amount = parseInt(match[1], 10)
  const unit = match[2].toLowerCase()
  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  return amount * (multipliers[unit] ?? 86400000)
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax' as const,
    maxAge: cookieMaxAge(),
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body ?? {}

    if (typeof name !== 'string' || name.trim().length === 0 || name.length > MAX_NAME_LENGTH) {
      res.status(400).json({ error: 'Name is required and must be 100 characters or fewer' })
      return
    }

    if (typeof email !== 'string' || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email.trim())) {
      res.status(400).json({ error: 'A valid email address is required' })
      return
    }

    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({ error: 'Password must be at least 8 characters' })
      return
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      res.status(400).json({ error: 'Password must be 128 characters or fewer' })
      return
    }

    const user = await authService.registerUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    })
    const token = authService.generateToken(user)

    res.cookie(config.cookieName, token, sessionCookieOptions())

    res.status(201).json({ user })
  } catch (error) {
    handleServiceError(res, error, 'Registration failed')
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {}

    if (typeof email !== 'string' || email.trim().length === 0) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    if (typeof password !== 'string' || password.length === 0) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    const user = await authService.loginUser({
      email: email.trim().toLowerCase(),
      password,
    })
    const token = authService.generateToken(user)

    res.cookie(config.cookieName, token, sessionCookieOptions())

    res.json({ user })
  } catch {
    res.status(401).json({ error: 'Invalid email or password' })
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(config.cookieName, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
  })
  res.json({ message: 'Logged out successfully' })
}

export async function me(req: Request, res: Response) {
  try {
    const user = await authService.getUserById(req.user!.id)

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Failed to get user' })
  }
}
