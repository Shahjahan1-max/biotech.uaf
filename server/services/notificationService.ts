import type { NotificationType as PrismaNotificationType } from '@prisma/client'
import { prisma } from '../utils/prisma'


const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export class NotificationValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotificationValidationError'
  }
}

export class NotificationNotFoundError extends Error {
  constructor() {
    super('Notification not found')
    this.name = 'NotificationNotFoundError'
  }
}

export interface NotificationInput {
  type: PrismaNotificationType
  title: string
  message: string
  link?: string | null
}

export interface NotificationRecord {
  id: string
  type: PrismaNotificationType
  title: string
  message: string
  link: string | null
  readAt: Date | null
  createdAt: Date
}

export interface NotificationPage {
  items: NotificationRecord[]
  page: number
  limit: number
  total: number
  totalPages: number
  unreadCount: number
}

export interface NotificationListFilters {
  page?: number
  limit?: number
  unreadOnly?: boolean
}

function toNotification(record: {
  id: string
  type: PrismaNotificationType
  title: string
  message: string
  link: string | null
  readAt: Date | null
  createdAt: Date
}): NotificationRecord {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    message: record.message,
    link: record.link,
    readAt: record.readAt,
    createdAt: record.createdAt,
  }
}

const notificationSelect = {
  id: true,
  type: true,
  title: true,
  message: true,
  link: true,
  readAt: true,
  createdAt: true,
} as const

function uniqueIds(userIds: string[]): string[] {
  return [...new Set(userIds.filter((id) => typeof id === 'string' && id.length > 0))]
}

export function excerpt(text: string, maxLength = 160): string {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= maxLength) return cleaned
  return `${cleaned.slice(0, maxLength - 1)}…`
}

export async function safeNotify(task: () => Promise<void>, context: string): Promise<void> {
  try {
    await task()
  } catch (error) {
    console.error(`Notification task failed (${context}):`, error)
  }
}

export async function createNotification(
  userId: string,
  input: NotificationInput
): Promise<void> {
  await createNotificationsForUsers([userId], input)
}

export async function createNotificationsForUsers(
  userIds: string[],
  input: NotificationInput
): Promise<void> {
  const targets = uniqueIds(userIds)
  if (targets.length === 0) return

  const existing = await prisma.notification.findMany({
    where: {
      userId: { in: targets },
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
    },
    select: { userId: true },
  })
  const alreadyNotified = new Set(existing.map((record) => record.userId))
  const fresh = targets.filter((id) => !alreadyNotified.has(id))
  if (fresh.length === 0) return

  await prisma.notification.createMany({
    data: fresh.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
    })),
  })
}

export async function getStudentIds(excludeUserId?: string): Promise<string[]> {
  const students = await prisma.user.findMany({
    where: { role: { name: 'STUDENT' } },
    select: { id: true },
  })
  return students
    .map((student) => student.id)
    .filter((id) => id !== excludeUserId)
}

export async function notifyStudents(
  input: NotificationInput,
  excludeUserId?: string
): Promise<void> {
  const studentIds = await getStudentIds(excludeUserId)
  await createNotificationsForUsers(studentIds, input)
}

export async function getUserNotifications(
  userId: string,
  filters: NotificationListFilters = {}
): Promise<NotificationPage> {
  const page = filters.page ?? 1
  const limit = filters.limit ?? DEFAULT_LIMIT

  if (!Number.isInteger(page) || page < 1) {
    throw new NotificationValidationError('Page must be a positive whole number')
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new NotificationValidationError(`Limit must be between 1 and ${MAX_LIMIT}`)
  }

  const where = {
    userId,
    ...(filters.unreadOnly ? { readAt: null } : {}),
  }

  const [total, unreadCount, records] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, readAt: null } }),
    prisma.notification.findMany({
      where,
      select: notificationSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    items: records.map(toNotification),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    unreadCount,
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } })
}

export async function markNotificationAsRead(id: string, userId: string): Promise<void> {
  const existing = await prisma.notification.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) throw new NotificationNotFoundError()

  if (existing.readAt) return

  await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  })
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  })
}

export async function deleteNotification(id: string, userId: string): Promise<void> {
  const existing = await prisma.notification.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) throw new NotificationNotFoundError()

  await prisma.notification.delete({ where: { id } })
}
