import type { Request, Response } from 'express'
import { getUserById } from '../services/authService.js'

export async function me(req: Request, res: Response) {
  try {
    const user = await getUserById(req.user!.id)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Failed to get user' })
  }
}
