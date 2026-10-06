import type { Request, Response } from 'express'
import * as announcementService from '../services/announcementService.js'
import type { AnnouncementListFilters } from '../types/announcement.js'

function optionalQuery(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function parsePositiveInt(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || value.trim().length === 0) return undefined

  const parsed = Number(value)
  if (!Number.isInteger(parsed)) {
    throw new announcementService.AnnouncementValidationError(
      `${field} must be a whole number`
    )
  }
  return parsed
}

function readFilters(query: Record<string, unknown>): AnnouncementListFilters {
  const includeExpiredRaw = optionalQuery(query.includeExpired as string)

  return {
    subjectId: optionalQuery(query.subjectId as string),
    scope: optionalQuery(query.scope as string),
    type: optionalQuery(query.type as string),
    priority: optionalQuery(query.priority as string),
    search: optionalQuery(query.search as string),
    includeExpired:
      includeExpiredRaw === 'true' ? true : includeExpiredRaw === 'false' ? false : undefined,
    page: parsePositiveInt(query.page, 'Page'),
    limit: parsePositiveInt(query.limit, 'Limit'),
  }
}

function isAdmin(req: Request): boolean {
  return req.user?.role === 'ADMIN'
}

function handleError(res: Response, error: unknown, fallback: string): void {
  if (error instanceof announcementService.AnnouncementNotFoundError) {
    res.status(404).json({ error: error.message })
    return
  }
  if (error instanceof announcementService.AnnouncementValidationError) {
    res.status(400).json({ error: error.message })
    return
  }
  res.status(500).json({ error: fallback })
}

export async function getAnnouncements(req: Request, res: Response) {
  try {
    const result = await announcementService.getAnnouncements(readFilters(req.query), isAdmin(req))
    res.json(result)
  } catch (error) {
    handleError(res, error, 'Failed to fetch announcements')
  }
}

export async function getAnnouncement(req: Request, res: Response) {
  try {
    const announcement = await announcementService.getAnnouncementById(
      req.params.id,
      isAdmin(req)
    )
    if (!announcement) {
      res.status(404).json({ error: 'Announcement not found' })
      return
    }
    res.json({ announcement })
  } catch (error) {
    handleError(res, error, 'Failed to fetch announcement')
  }
}

export async function createAnnouncement(req: Request, res: Response) {
  try {
    const announcement = await announcementService.createAnnouncement(
      req.user!.id,
      req.body
    )
    res.status(201).json({ announcement })
  } catch (error) {
    handleError(res, error, 'Failed to create announcement')
  }
}

export async function updateAnnouncement(req: Request, res: Response) {
  try {
    const announcement = await announcementService.updateAnnouncement(
      req.params.id,
      req.body
    )
    res.json({ announcement })
  } catch (error) {
    handleError(res, error, 'Failed to update announcement')
  }
}

export async function deleteAnnouncement(req: Request, res: Response) {
  try {
    await announcementService.deleteAnnouncement(req.params.id)
    res.json({ message: 'Announcement deleted successfully' })
  } catch (error) {
    handleError(res, error, 'Failed to delete announcement')
  }
}
