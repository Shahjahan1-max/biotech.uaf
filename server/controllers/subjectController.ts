import type { Request, Response } from 'express'
import * as subjectService from '../services/subjectService'
import { handleServiceError } from '../utils/handleServiceError'

const MAX_NAME_LENGTH = 200
const MAX_CODE_LENGTH = 20
const MAX_DESCRIPTION_LENGTH = 2000

export async function getSubjects(_req: Request, res: Response) {
  try {
    const subjects = await subjectService.getAllSubjects()
    res.json({ subjects })
  } catch {
    res.status(500).json({ error: 'Failed to fetch subjects' })
  }
}

export async function getSubject(req: Request, res: Response) {
  try {
    const subject = await subjectService.getSubjectById(req.params.id)

    if (!subject) {
      res.status(404).json({ error: 'Subject not found' })
      return
    }

    res.json({ subject })
  } catch {
    res.status(500).json({ error: 'Failed to fetch subject' })
  }
}

function validateSubjectInput(body: unknown): {
  name: string
  code: string
  description?: string
} | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null

  const { name, code, description } = body as Record<string, unknown>

  if (typeof name !== 'string' || typeof code !== 'string') return null
  if (name.trim().length === 0 || code.trim().length === 0) return null
  if (name.length > MAX_NAME_LENGTH || code.length > MAX_CODE_LENGTH) return null

  if (
    description !== undefined &&
    description !== null &&
    (typeof description !== 'string' || description.length > MAX_DESCRIPTION_LENGTH)
  ) {
    return null
  }

  return {
    name: name.trim(),
    code: code.trim(),
    description: typeof description === 'string' ? description : undefined,
  }
}

export async function createSubject(req: Request, res: Response) {
  try {
    const input = validateSubjectInput(req.body)
    if (!input) {
      res.status(400).json({ error: 'Name and code are required and must be valid' })
      return
    }

    const subject = await subjectService.createSubject(input)
    res.status(201).json({ subject })
  } catch (error) {
    handleServiceError(res, error, 'Failed to create subject')
  }
}

export async function updateSubject(req: Request, res: Response) {
  try {
    const input = validateSubjectInput(req.body)
    if (!input) {
      res.status(400).json({ error: 'Name and code are required and must be valid' })
      return
    }

    const subject = await subjectService.updateSubject(req.params.id, input)
    res.json({ subject })
  } catch (error) {
    handleServiceError(res, error, 'Failed to update subject')
  }
}

export async function deleteSubject(req: Request, res: Response) {
  try {
    await subjectService.deleteSubject(req.params.id)
    res.json({ message: 'Subject deleted successfully' })
  } catch (error) {
    handleServiceError(res, error, 'Failed to delete subject')
  }
}
