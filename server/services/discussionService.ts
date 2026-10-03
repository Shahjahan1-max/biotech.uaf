import { prisma } from '../utils/prisma.js'
import type {
  DiscussionListFilters,
  DiscussionPost,
  DiscussionReply,
  PaginatedDiscussions,
} from '../types/discussion.js'
import { createNotification, excerpt, safeNotify } from './notificationService.js'


const TITLE_MIN_LENGTH = 5
const TITLE_MAX_LENGTH = 200
const POST_MAX_LENGTH = 10000
const REPLY_MAX_LENGTH = 5000
const SEARCH_MAX_LENGTH = 200
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export class DiscussionValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DiscussionValidationError'
  }
}

export class DiscussionNotFoundError extends Error {
  constructor() {
    super('Discussion not found')
    this.name = 'DiscussionNotFoundError'
  }
}

export class DiscussionForbiddenError extends Error {
  constructor() {
    super('You do not have permission to modify this content')
    this.name = 'DiscussionForbiddenError'
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
    throw new DiscussionValidationError(`${field} is required`)
  }

  const cleaned = value.trim()
  if (cleaned.length < minLength) {
    throw new DiscussionValidationError(
      `${field} must be at least ${minLength} characters`
    )
  }
  if (cleaned.length > maxLength) {
    throw new DiscussionValidationError(
      `${field} must be ${maxLength} characters or fewer`
    )
  }
  if (hasControlCharacters(cleaned)) {
    throw new DiscussionValidationError(`${field} contains invalid characters`)
  }

  return cleaned
}

function readBody(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new DiscussionValidationError('Invalid request body')
  }
  return body as Record<string, unknown>
}

function validatePostInput(body: unknown): { title: string; content: string; subjectId: string } {
  const source = readBody(body)

  const title = cleanText(source.title, 'Title', TITLE_MIN_LENGTH, TITLE_MAX_LENGTH)
  const content = cleanText(source.content, 'Content', 1, POST_MAX_LENGTH)
  if (typeof source.subjectId !== 'string' || source.subjectId.trim().length === 0) {
    throw new DiscussionValidationError('Subject is required')
  }

  return { title, content, subjectId: source.subjectId.trim() }
}

function validateReplyInput(body: unknown): { content: string } {
  const source = readBody(body)
  return { content: cleanText(source.content, 'Content', 1, REPLY_MAX_LENGTH) }
}

function assertOwnerOrAdmin(authorId: string, user: { id: string; role: string }): void {
  if (user.role === 'ADMIN') return
  if (user.id !== authorId) throw new DiscussionForbiddenError()
}

async function assertSubjectExists(subjectId: string): Promise<void> {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
  if (!subject) throw new DiscussionValidationError('Subject not found')
}

function toPost(record: {
  id: string
  title: string
  content: string
  authorId: string
  subjectId: string
  author?: { id: string; name: string }
  subject?: { id: string; name: string; code: string }
  _count?: { replies: number }
  createdAt: Date
  updatedAt: Date
}): DiscussionPost {
  return {
    id: record.id,
    title: record.title,
    content: record.content,
    authorId: record.authorId,
    subjectId: record.subjectId,
    author: record.author,
    subject: record.subject,
    replyCount: record._count?.replies ?? 0,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function toReply(record: {
  id: string
  content: string
  authorId: string
  postId: string
  author?: { id: string; name: string }
  createdAt: Date
  updatedAt: Date
}): DiscussionReply {
  return {
    id: record.id,
    content: record.content,
    authorId: record.authorId,
    postId: record.postId,
    author: record.author,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function buildSearchFilter(search: string) {
  return {
    OR: [
      { title: { contains: search, mode: 'insensitive' as const } },
      { content: { contains: search, mode: 'insensitive' as const } },
    ],
  }
}

export async function getPosts(filters: DiscussionListFilters = {}): Promise<PaginatedDiscussions> {
  const page = filters.page ?? 1
  const limit = filters.limit ?? DEFAULT_LIMIT

  if (!Number.isInteger(page) || page < 1) {
    throw new DiscussionValidationError('Page must be a positive whole number')
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new DiscussionValidationError(`Limit must be between 1 and ${MAX_LIMIT}`)
  }

  const where: Record<string, unknown> = {}
  if (filters.subjectId) {
    if (typeof filters.subjectId !== 'string' || filters.subjectId.trim().length === 0) {
      throw new DiscussionValidationError('Subject filter is invalid')
    }
    where.subjectId = filters.subjectId.trim()
  }
  if (filters.search) {
    const search = cleanText(
      filters.search,
      'Search',
      1,
      SEARCH_MAX_LENGTH
    )
    where.AND = [buildSearchFilter(search)]
  }

  const [total, records] = await Promise.all([
    prisma.discussionPost.count({ where }),
    prisma.discussionPost.findMany({
      where,
      include: {
        author: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    items: records.map(toPost),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

export async function getPostById(id: string): Promise<DiscussionPost | null> {
  const record = await prisma.discussionPost.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
      _count: { select: { replies: true } },
    },
  })
  return record ? toPost(record) : null
}

export async function getReplies(postId: string): Promise<DiscussionReply[]> {
  const post = await prisma.discussionPost.findUnique({
    where: { id: postId },
    select: { id: true },
  })
  if (!post) throw new DiscussionNotFoundError()

  const records = await prisma.discussionReply.findMany({
    where: { postId },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return records.map(toReply)
}

export async function createPost(
  authorId: string,
  body: unknown
): Promise<DiscussionPost> {
  const input = validatePostInput(body)
  await assertSubjectExists(input.subjectId)

  const record = await prisma.discussionPost.create({
    data: { ...input, authorId },
    include: {
      author: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
      _count: { select: { replies: true } },
    },
  })
  return toPost(record)
}

export async function updatePost(
  id: string,
  user: { id: string; role: string },
  body: unknown
): Promise<DiscussionPost> {
  const existing = await prisma.discussionPost.findUnique({ where: { id } })
  if (!existing) throw new DiscussionNotFoundError()
  assertOwnerOrAdmin(existing.authorId, user)

  const input = validatePostInput(body)
  if (input.subjectId !== existing.subjectId) {
    await assertSubjectExists(input.subjectId)
  }

  const record = await prisma.discussionPost.update({
    where: { id },
    data: input,
    include: {
      author: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
      _count: { select: { replies: true } },
    },
  })
  return toPost(record)
}

export async function deletePost(
  id: string,
  user: { id: string; role: string }
): Promise<void> {
  const existing = await prisma.discussionPost.findUnique({ where: { id } })
  if (!existing) throw new DiscussionNotFoundError()
  assertOwnerOrAdmin(existing.authorId, user)

  await prisma.discussionPost.delete({ where: { id } })
}

export async function createReply(
  postId: string,
  authorId: string,
  body: unknown
): Promise<DiscussionReply> {
  const post = await prisma.discussionPost.findUnique({
    where: { id: postId },
    select: { id: true, title: true, authorId: true },
  })
  if (!post) throw new DiscussionNotFoundError()

  const input = validateReplyInput(body)
  const record = await prisma.discussionReply.create({
    data: { ...input, authorId, postId },
    include: { author: { select: { id: true, name: true } } },
  })

  if (post.authorId !== authorId) {
    await safeNotify(
      () =>
        createNotification(post.authorId, {
          type: 'DISCUSSION_REPLY',
          title: `Reply to "${post.title}"`,
          message: excerpt(record.content),
          link: `/discussions/${postId}`,
        }),
      'discussion-reply'
    )
  }

  return toReply(record)
}

export async function updateReply(
  replyId: string,
  user: { id: string; role: string },
  body: unknown
): Promise<DiscussionReply> {
  const existing = await prisma.discussionReply.findUnique({ where: { id: replyId } })
  if (!existing) throw new DiscussionNotFoundError()
  assertOwnerOrAdmin(existing.authorId, user)

  const input = validateReplyInput(body)
  const record = await prisma.discussionReply.update({
    where: { id: replyId },
    data: input,
    include: { author: { select: { id: true, name: true } } },
  })
  return toReply(record)
}

export async function deleteReply(
  replyId: string,
  user: { id: string; role: string }
): Promise<void> {
  const existing = await prisma.discussionReply.findUnique({ where: { id: replyId } })
  if (!existing) throw new DiscussionNotFoundError()
  assertOwnerOrAdmin(existing.authorId, user)

  await prisma.discussionReply.delete({ where: { id: replyId } })
}
