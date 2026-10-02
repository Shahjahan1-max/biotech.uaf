import { prisma } from '../utils/prisma'


const SEARCH_MAX_LENGTH = 200
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export class AdminValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AdminValidationError'
  }
}

export interface AdminStudent {
  id: string
  name: string
  email: string
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
