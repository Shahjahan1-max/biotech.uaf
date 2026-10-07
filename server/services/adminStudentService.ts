import { Prisma } from '@prisma/client'
import { prisma } from '../utils/prisma.js'


const SEARCH_MAX_LENGTH = 200
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
const MAX_USERNAME_LENGTH = 50
const USERNAME_PATTERN = /^[A-Za-z0-9@._-]+$/

export class AdminValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AdminValidationError'
  }
}

export interface AdminStudent {
  id: string
  name: string
  username: string
  email: string | null
  role: string
  createdAt: Date
}

export interface PaginatedAdminStudents {
  items: AdminStudent[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AdminStudentFilters {
  search?: string
  page?: number
  limit?: number
}

export async function getStudents(
  filters: AdminStudentFilters = {}
): Promise<PaginatedAdminStudents> {
  const page = filters.page ?? 1
  const limit = filters.limit ?? DEFAULT_LIMIT

  if (!Number.isInteger(page) || page < 1) {
    throw new AdminValidationError('Page must be a positive whole number')
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new AdminValidationError(`Limit must be between 1 and ${MAX_LIMIT}`)
  }

  const clauses: Record<string, unknown>[] = []

  if (filters.search) {
    const search = filters.search.trim()
    if (search.length === 0 || search.length > SEARCH_MAX_LENGTH) {
      throw new AdminValidationError(`Search must be between 1 and ${SEARCH_MAX_LENGTH} characters`)
    }

    clauses.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    })
  }

  const where = clauses.length > 0 ? { AND: clauses } : {}

  const [total, records] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    items: records.map((record) => ({
      id: record.id,
      name: record.name,
      username: record.username,
      email: record.email,
      role: record.role.name,
      createdAt: record.createdAt,
    })),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

export async function updateStudentUsername(
  studentId: string,
  username: string
): Promise<AdminStudent> {
  if (typeof username !== 'string' || username.trim().length === 0) {
    throw new AdminValidationError('Username is required')
  }
  if (username.length > MAX_USERNAME_LENGTH) {
    throw new AdminValidationError('Username must be 50 characters or fewer')
  }
  if (!USERNAME_PATTERN.test(username.trim())) {
    throw new AdminValidationError('Username may only contain letters, numbers, and @ . _ -')
  }

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, role: { select: { name: true } } },
  })

  if (!student) {
    throw new Error('Student not found')
  }

  if (student.role.name !== 'STUDENT') {
    throw new AdminValidationError('Only student accounts can be updated')
  }

  const existing = await prisma.user.findUnique({
    where: { username: username.trim() },
    select: { id: true },
  })

  if (existing && existing.id !== studentId) {
    throw new Error('Student ID already registered')
  }

  try {
    const updated = await prisma.user.update({
      where: { id: studentId },
      data: { username: username.trim() },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: { select: { name: true } },
        createdAt: true,
      },
    })

    return {
      id: updated.id,
      name: updated.name,
      username: updated.username,
      email: updated.email,
      role: updated.role.name,
      createdAt: updated.createdAt,
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('Student ID already registered')
    }
    throw error
  }
}
