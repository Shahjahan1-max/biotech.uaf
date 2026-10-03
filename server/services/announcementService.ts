import type { AnnouncementPriority, AnnouncementType } from '@prisma/client'
import { prisma } from '../utils/prisma.js'
import type {
  Announcement,
  AnnouncementListFilters,
  PaginatedAnnouncements,
} from '../types/announcement.js'
import {
  ANNOUNCEMENT_PRIORITIES,
  ANNOUNCEMENT_TYPES,
} from '../types/announcement.js'
import { excerpt, notifyStudents, safeNotify } from './notificationService.js'


const TITLE_MIN_LENGTH = 5
const TITLE_MAX_LENGTH = 200
const CONTENT_MAX_LENGTH = 10000
const SEARCH_MAX_LENGTH = 200
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export class AnnouncementValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AnnouncementValidationError'
  }
}

export class AnnouncementNotFoundError extends Error {
  constructor() {
    super('Announcement not found')
    this.name = 'AnnouncementNotFoundError'
  }
}

function hasControlCharacters(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code < 32 || code === 127) return true
  }
  return false
}

function cleanText(value: unknown, field: string, minLength: number, maxLength: number): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AnnouncementValidationError(`${field} is required`)
  }

  const cleaned = value.trim()
  if (cleaned.length < minLength) {
    throw new AnnouncementValidationError(`${field} must be at least ${minLength} characters`)
  }
  if (cleaned.length > maxLength) {
    throw new AnnouncementValidationError(`${field} must be ${maxLength} characters or fewer`)
  }
  if (hasControlCharacters(cleaned)) {
    throw new AnnouncementValidationError(`${field} contains invalid characters`)
  }

  return cleaned
}

function readBody(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new AnnouncementValidationError('Invalid request body')
  }
  return body as Record<string, unknown>
}

function isAnnouncementType(value: unknown): value is AnnouncementType {
  return typeof value === 'string' && (ANNOUNCEMENT_TYPES as readonly string[]).includes(value)
}

function isAnnouncementPriority(value: unknown): value is AnnouncementPriority {
  return typeof value === 'string' && (ANNOUNCEMENT_PRIORITIES as readonly string[]).includes(value)
}

function parseExpiresAt(value: unknown): Date | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') {
    throw new AnnouncementValidationError('Expiry must be a valid date and time')
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new AnnouncementValidationError('Expiry must be a valid date and time')
  }
  return parsed
}

function validateInput(body: unknown): {
  title: string
  content: string
  type: AnnouncementType
  priority: AnnouncementPriority
  subjectId: string | null
  expiresAt: Date | null
} {
  const source = readBody(body)

  const title = cleanText(source.title, 'Title', TITLE_MIN_LENGTH, TITLE_MAX_LENGTH)
  const content = cleanText(source.content, 'Content', 1, CONTENT_MAX_LENGTH)

  if (!isAnnouncementType(source.type)) {
    throw new AnnouncementValidationError('Type must be a valid announcement type')
  }
  if (!isAnnouncementPriority(source.priority)) {
    throw new AnnouncementValidationError('Priority must be a valid priority level')
  }

  let subjectId: string | null = null
  if (source.subjectId !== undefined && source.subjectId !== null && source.subjectId !== '') {
    if (typeof source.subjectId !== 'string' || source.subjectId.trim().length === 0) {
      throw new AnnouncementValidationError('Subject is invalid')
    }
    subjectId = source.subjectId.trim()
  }

  return {
    title,
    content,
    type: source.type,
    priority: source.priority,
    subjectId,
    expiresAt: parseExpiresAt(source.expiresAt),
  }
}

async function assertSubjectExists(subjectId: string): Promise<void> {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
  if (!subject) throw new AnnouncementValidationError('Subject not found')
}

function isExpired(expiresAt: Date | null): boolean {
  return expiresAt !== null && expiresAt.getTime() < Date.now()
}

function toAnnouncement(record: {
  id: string
  title: string
  content: string
  type: AnnouncementType
  priority: AnnouncementPriority
  subjectId: string | null
  subject?: { id: string; name: string; code: string } | null
  authorId: string
  author?: { id: string; name: string }
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
}): Announcement {
  return {
    id: record.id,
    title: record.title,
    content: record.content,
    type: record.type,
    priority: record.priority,
    subjectId: record.subjectId,
    subject: record.subject ?? null,
    authorId: record.authorId,
    author: record.author,
    expiresAt: record.expiresAt,
    isExpired: isExpired(record.expiresAt),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

const announcementInclude = {
  author: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true, code: true } },
} as const

function activeOnlyWhere(now: Date) {
  return { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] }
}

function buildSearchFilter(search: string) {
  return {
    OR: [
      { title: { contains: search, mode: 'insensitive' as const } },
      { content: { contains: search, mode: 'insensitive' as const } },
    ],
  }
}

export async function getAnnouncements(
  filters: AnnouncementListFilters = {},
  isAdmin: boolean
): Promise<PaginatedAnnouncements> {
  const page = filters.page ?? 1
  const limit = filters.limit ?? DEFAULT_LIMIT

  if (!Number.isInteger(page) || page < 1) {
    throw new AnnouncementValidationError('Page must be a positive whole number')
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new AnnouncementValidationError(`Limit must be between 1 and ${MAX_LIMIT}`)
  }

  const clauses: Record<string, unknown>[] = []

  const includeExpired = isAdmin && filters.includeExpired === true
  if (!includeExpired) clauses.push(activeOnlyWhere(new Date()))

  if (filters.subjectId) {
    if (typeof filters.subjectId !== 'string' || filters.subjectId.trim().length === 0) {
      throw new AnnouncementValidationError('Subject filter is invalid')
    }
    clauses.push({ subjectId: filters.subjectId.trim() })
  }

  if (filters.type !== undefined && filters.type !== '') {
    if (!isAnnouncementType(filters.type)) {
      throw new AnnouncementValidationError('Type must be a valid announcement type')
    }
    clauses.push({ type: filters.type })
  }

  if (filters.priority !== undefined && filters.priority !== '') {
    if (!isAnnouncementPriority(filters.priority)) {
      throw new AnnouncementValidationError('Priority must be a valid priority level')
    }
    clauses.push({ priority: filters.priority })
  }

  if (filters.search) {
    const search = cleanText(filters.search, 'Search', 1, SEARCH_MAX_LENGTH)
    clauses.push(buildSearchFilter(search))
  }

  const where = clauses.length > 0 ? { AND: clauses } : {}

  const [total, records] = await Promise.all([
    prisma.announcement.count({ where }),
    prisma.announcement.findMany({
      where,
      include: announcementInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    items: records.map(toAnnouncement),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

export async function getAnnouncementById(
  id: string,
  isAdmin: boolean
): Promise<Announcement | null> {
  const record = await prisma.announcement.findUnique({
    where: { id },
    include: announcementInclude,
  })
  if (!record) return null
  if (!isAdmin && isExpired(record.expiresAt)) return null
  return toAnnouncement(record)
}

export async function createAnnouncement(
  authorId: string,
  body: unknown
): Promise<Announcement> {
  const input = validateInput(body)
  if (input.subjectId) await assertSubjectExists(input.subjectId)

  const record = await prisma.announcement.create({
    data: {
      title: input.title,
      content: input.content,
      type: input.type,
      priority: input.priority,
      subjectId: input.subjectId,
      expiresAt: input.expiresAt,
      authorId,
    },
    include: announcementInclude,
  })

  await safeNotify(
    () =>
      notifyStudents(
        {
          type: 'ANNOUNCEMENT',
          title: record.title,
          message: excerpt(record.content),
          link: `/announcements/${record.id}`,
        },
        authorId
      ),
    'announcement-create'
  )

  return toAnnouncement(record)
}

export async function updateAnnouncement(id: string, body: unknown): Promise<Announcement> {
  const existing = await prisma.announcement.findUnique({ where: { id } })
  if (!existing) throw new AnnouncementNotFoundError()

  const input = validateInput(body)
  if (input.subjectId) await assertSubjectExists(input.subjectId)

  const record = await prisma.announcement.update({
    where: { id },
    data: {
      title: input.title,
      content: input.content,
      type: input.type,
      priority: input.priority,
      subjectId: input.subjectId,
      expiresAt: input.expiresAt,
    },
    include: announcementInclude,
  })
  return toAnnouncement(record)
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const existing = await prisma.announcement.findUnique({ where: { id } })
  if (!existing) throw new AnnouncementNotFoundError()

  await prisma.announcement.delete({ where: { id } })
}
