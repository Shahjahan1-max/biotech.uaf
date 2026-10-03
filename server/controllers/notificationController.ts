import type { Request, Response } from 'express'
import {
  NotificationValidationError,
  NotificationNotFoundError,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../services/notificationService.js'

const MAX_LIMIT = 100

function parsePositiveInt(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') return fallback
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) throw new NotificationValidationError('Invalid query parameter')
  return parsed
}

function handleError(error: unknown, res: Response): void {
  if (error instanceof NotificationValidationError) {
    res.status(400).json({ error: error.message })
    return
  }
  if (error instanceof NotificationNotFoundError) {
    res.status(404).json({ error: 'Notification not found' })
    return
  }
  res.status(500).json({ error: 'Internal server error' })
}

export async function listNotifications(req: Request, res: Response): Promise<void> {
  try {
    const page = parsePositiveInt(req.query.page, 1)
    const limit = parsePositiveInt(req.query.limit, 20)
    if (page < 1) throw new NotificationValidationError('Page must be a positive whole number')
    if (limit < 1 || limit > MAX_LIMIT) {
      throw new NotificationValidationError(`Limit must be between 1 and ${MAX_LIMIT}`)
    }

    const unreadOnly = req.query.unreadOnly === 'true'
    const result = await getUserNotifications(req.user!.id, { page, limit, unreadOnly })
    res.json(result)
  } catch (error) {
    handleError(error, res)
  }
}

export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  try {
    const count = await getUnreadNotificationCount(req.user!.id)
    res.json({ count })
  } catch (error) {
    handleError(error, res)
  }
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    if (!id) throw new NotificationValidationError('Notification id is required')
    await markNotificationAsRead(id, req.user!.id)
    res.json({ success: true })
  } catch (error) {
    handleError(error, res)
  }
}

export async function markAllAsRead(req: Request, res: Response): Promise<void> {
  try {
    await markAllNotificationsAsRead(req.user!.id)
    res.json({ success: true })
  } catch (error) {
    handleError(error, res)
  }
}

export async function removeNotification(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    if (!id) throw new NotificationValidationError('Notification id is required')
    await deleteNotification(id, req.user!.id)
    res.json({ success: true })
  } catch (error) {
    handleError(error, res)
  }
}
