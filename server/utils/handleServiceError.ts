import type { Response } from 'express'
import { DrizzleQueryError } from 'drizzle-orm'
import { RecordNotFoundError } from '../../db/repository.js'

const NOT_FOUND_MESSAGES = ['Subject not found', 'Resource not found', 'Assignment not found']

export function handleServiceError(res: Response, error: unknown, fallback: string): void {
  if (error instanceof RecordNotFoundError) {
      res.status(404).json({ error: 'Resource not found' })
      return
  }
  if (error instanceof DrizzleQueryError) {
    const code = (error.cause as { code?: string } | undefined)?.code
    if (code === '23505') {
      res.status(409).json({ error: 'Resource already exists' })
      return
    }
    if (code === '23503') {
      res.status(400).json({ error: 'A related record does not exist' })
      return
    }
    res.status(500).json({ error: fallback })
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

  res.status(500).json({ error: fallback })
}
