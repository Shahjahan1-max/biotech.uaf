import type { Request, Response } from 'express'
import * as assignmentService from '../services/assignmentService.js'
import { handleServiceError } from '../utils/handleServiceError.js'

const MAX_TITLE_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 5000

export async function getAssignments(req: Request, res: Response) {
  try {
    const subjectId = req.query.subjectId as string | undefined
    const assignments = await assignmentService.getAssignments(subjectId)
    res.json({ assignments })
  } catch {
    res.status(500).json({ error: 'Failed to fetch assignments' })
  }
}

export async function getAssignment(req: Request, res: Response) {
  try {
    const assignment = await assignmentService.getAssignment(req.params.id)
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' })
      return
    }
    res.json({ assignment })
  } catch {
    res.status(500).json({ error: 'Failed to fetch assignment' })
  }
}

function validateAssignmentInput(body: unknown):
  | {
      title: string
      description: string | null
      dueDate: Date
      subjectId: string
      fileName?: string | null
      filePath?: string | null
    }
  | { error: string }
  | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { error: 'Invalid request body' }
  }

  const { title, description, dueDate, subjectId, fileName, filePath } = body as Record<
    string,
    unknown
  >

  if (typeof title !== 'string' || title.trim().length === 0) {
    return { error: 'Title is required' }
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer` }
  }

  if (typeof dueDate !== 'string' || dueDate.trim().length === 0) {
    return { error: 'Due date is required' }
  }
  const parsedDueDate = new Date(dueDate)
  if (Number.isNaN(parsedDueDate.getTime())) {
    return { error: 'Due date must be a valid date' }
  }

  if (typeof subjectId !== 'string' || subjectId.trim().length === 0) {
    return { error: 'Subject is required' }
  }

  if (
    description !== undefined &&
    description !== null &&
    (typeof description !== 'string' || description.length > MAX_DESCRIPTION_LENGTH)
  ) {
    return { error: 'Description must be a valid string of 5000 characters or fewer' }
  }

  if (
    (fileName !== undefined && fileName !== null && typeof fileName !== 'string') ||
    (filePath !== undefined && filePath !== null && typeof filePath !== 'string')
  ) {
    return { error: 'Attachment information is invalid' }
  }

  return {
    title: title.trim(),
    description: typeof description === 'string' && description.length > 0 ? description : null,
    dueDate: parsedDueDate,
    subjectId: subjectId.trim(),
    fileName: fileName === null ? null : typeof fileName === 'string' ? fileName : undefined,
    filePath: filePath === null ? null : typeof filePath === 'string' ? filePath : undefined,
  }
}

export async function createAssignment(req: Request, res: Response) {
  try {
    const input = validateAssignmentInput(req.body)
    if (input && 'error' in input) {
      res.status(400).json({ error: input.error })
      return
    }
    if (!input) {
      res.status(400).json({ error: 'Invalid request body' })
      return
    }

    const assignment = await assignmentService.createAssignment(input)
    res.status(201).json({ assignment })
  } catch (error) {
    handleServiceError(res, error, 'Failed to create assignment')
  }
}

export async function updateAssignment(req: Request, res: Response) {
  try {
    const input = validateAssignmentInput(req.body)
    if (input && 'error' in input) {
      res.status(400).json({ error: input.error })
      return
    }
    if (!input) {
      res.status(400).json({ error: 'Invalid request body' })
      return
    }

    const assignment = await assignmentService.updateAssignment(req.params.id, input)
    res.json({ assignment })
  } catch (error) {
    handleServiceError(res, error, 'Failed to update assignment')
  }
}

export async function deleteAssignment(req: Request, res: Response) {
  try {
    await assignmentService.deleteAssignment(req.params.id)
    res.json({ message: 'Assignment deleted successfully' })
  } catch (error) {
    handleServiceError(res, error, 'Failed to delete assignment')
  }
}
