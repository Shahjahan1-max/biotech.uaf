import type { Response } from 'express'
import { Prisma } from '@prisma/client'

const NOT_FOUND_MESSAGES = ['Subject not found', 'Resource not found', 'Assignment not found']

export function handleServiceError(res: Response, error: unknown, fallback: string): void {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Resource not found' })
      return
    }
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Resource already exists' })
      return
    }
    if (error.code === 'P2003') {
      res.status(400).json({ error: 'A related record does not exist' })
      return
    }
    console.error(error.message)
    res.status(500).json({ error: fallback })
    return
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ error: 'Invalid request data' })
    return
  }

  if (error instanceof Error && error.name !== 'TypeError' && !(error instanceof SyntaxError)) {
    if (error.message === 'Email already registered') {
      res.status(409).json({ error: 'Email already registered' })
      return
    }
    if (NOT_FOUND_MESSAGES.includes(error.message)) {
      res.status(404).json({ error: error.message })
      return
    }
    res.status(400).json({ error: error.message })
    return
  }

  console.error(error instanceof Error ? error.message : 'Unknown server error')
  res.status(500).json({ error: fallback })
}
