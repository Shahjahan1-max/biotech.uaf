import type { Request, Response } from 'express'
import * as adminStudentService from '../services/adminStudentService.js'

function optionalQuery(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function parsePositiveInt(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || value.trim().length === 0) return undefined

  const parsed = Number(value)
  if (!Number.isInteger(parsed)) {
    throw new adminStudentService.AdminValidationError(`${field} must be a whole number`)
  }
  return parsed
}

function readFilters(query: Record<string, unknown>): adminStudentService.AdminStudentFilters {
  return {
    search: optionalQuery(query.search as string),
    page: parsePositiveInt(query.page, 'Page'),
    limit: parsePositiveInt(query.limit, 'Limit'),
  }
}

export async function getStudents(req: Request, res: Response) {
  try {
    const result = await adminStudentService.getStudents(readFilters(req.query))
    res.json(result)
  } catch (error) {
    if (error instanceof adminStudentService.AdminValidationError) {
      res.status(400).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Failed to fetch students' })
  }
}

export async function updateStudentUsername(req: Request, res: Response) {
  try {
    const username = typeof req.body?.username === 'string' ? req.body.username : ''
    const student = await adminStudentService.updateStudentUsername(
      req.params.id ?? '',
      username
    )
    res.json({ student })
  } catch (error) {
    if (error instanceof adminStudentService.AdminValidationError) {
      res.status(400).json({ error: error.message })
      return
    }
    if (error instanceof Error && error.message === 'Student not found') {
      res.status(404).json({ error: 'Student not found' })
      return
    }
    if (error instanceof Error && error.message === 'Student ID already registered') {
      res.status(409).json({ error: 'Student ID already registered' })
      return
    }
    res.status(500).json({ error: 'Failed to update Student ID' })
  }
}
