import type { Request, Response } from 'express'
import * as discussionService from '../services/discussionService.js'
import type { DiscussionListFilters } from '../types/discussion.js'

function optionalQuery(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function parsePositiveInt(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || value.trim().length === 0) return undefined

  const parsed = Number(value)
  if (!Number.isInteger(parsed)) {
    throw new discussionService.DiscussionValidationError(
      `${field} must be a whole number`
    )
  }
  return parsed
}

function readFilters(query: Record<string, unknown>): DiscussionListFilters {
  return {
    subjectId: optionalQuery(query.subjectId as string),
    search: optionalQuery(query.search as string),
    page: parsePositiveInt(query.page, 'Page'),
    limit: parsePositiveInt(query.limit, 'Limit'),
  }
}

function handleError(res: Response, error: unknown, fallback: string): void {
  if (error instanceof discussionService.DiscussionNotFoundError) {
    res.status(404).json({ error: error.message })
    return
  }
  if (error instanceof discussionService.DiscussionForbiddenError) {
    res.status(403).json({ error: error.message })
    return
  }
  if (error instanceof discussionService.DiscussionValidationError) {
    res.status(400).json({ error: error.message })
    return
  }
  res.status(500).json({ error: fallback })
}

function requireUser(req: Request): { id: string; role: string } {
  return { id: req.user!.id, role: req.user!.role }
}

export async function getPosts(req: Request, res: Response) {
  try {
    const result = await discussionService.getPosts(readFilters(req.query))
    res.json(result)
  } catch (error) {
    handleError(res, error, 'Failed to fetch discussions')
  }
}

export async function getPost(req: Request, res: Response) {
  try {
    const post = await discussionService.getPostById(req.params.id)
    if (!post) {
      res.status(404).json({ error: 'Discussion not found' })
      return
    }
    res.json({ post })
  } catch (error) {
    handleError(res, error, 'Failed to fetch discussion')
  }
}

export async function createPost(req: Request, res: Response) {
  try {
    const post = await discussionService.createPost(req.user!.id, req.body)
    res.status(201).json({ post })
  } catch (error) {
    handleError(res, error, 'Failed to create discussion')
  }
}

export async function updatePost(req: Request, res: Response) {
  try {
    const post = await discussionService.updatePost(req.params.id, requireUser(req), req.body)
    res.json({ post })
  } catch (error) {
    handleError(res, error, 'Failed to update discussion')
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    await discussionService.deletePost(req.params.id, requireUser(req))
    res.json({ message: 'Discussion deleted successfully' })
  } catch (error) {
    handleError(res, error, 'Failed to delete discussion')
  }
}

export async function getReplies(req: Request, res: Response) {
  try {
    const replies = await discussionService.getReplies(req.params.id)
    res.json({ replies })
  } catch (error) {
    handleError(res, error, 'Failed to fetch replies')
  }
}

export async function createReply(req: Request, res: Response) {
  try {
    const reply = await discussionService.createReply(req.params.id, req.user!.id, req.body)
    res.status(201).json({ reply })
  } catch (error) {
    handleError(res, error, 'Failed to create reply')
  }
}

export async function updateReply(req: Request, res: Response) {
  try {
    const reply = await discussionService.updateReply(
      req.params.replyId,
      requireUser(req),
      req.body
    )
    res.json({ reply })
  } catch (error) {
    handleError(res, error, 'Failed to update reply')
  }
}

export async function deleteReply(req: Request, res: Response) {
  try {
    await discussionService.deleteReply(req.params.replyId, requireUser(req))
    res.json({ message: 'Reply deleted successfully' })
  } catch (error) {
    handleError(res, error, 'Failed to delete reply')
  }
}
