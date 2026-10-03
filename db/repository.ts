import { and, or, eq, ne, gte, ilike, inArray, isNull, asc, desc, count, getTableColumns, type SQL, type InferSelectModel, type InferInsertModel } from 'drizzle-orm'
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core'
import { getDatabase } from './index.js'
import * as schema from './schema.js'

type Selection = Record<string, boolean | { select: Selection }>
type QueryOptions = {
  where?: Record<string, unknown>
  select?: Selection
  include?: Selection
  orderBy?: Record<string, 'asc' | 'desc'>
  skip?: number
  take?: number
}
type RelatedRecord = {
  subject: typeof schema.subjects.$inferSelect
  author: Pick<typeof schema.users.$inferSelect, 'id' | 'name'>
  _count: { replies: number }
}
type Result<Table extends PgTable> = Omit<InferSelectModel<Table>, 'role'> & RelatedRecord &
  (Table extends typeof schema.users ? { role: { name: string } } : object)

export class RecordNotFoundError extends Error {
  constructor() {
    super('Resource not found')
    this.name = 'RecordNotFoundError'
  }
}

function filterFor(table: PgTable, where: Record<string, unknown> = {}): SQL | undefined {
  const columns = getTableColumns(table) as Record<string, PgColumn>
  const clauses: (SQL | undefined)[] = []
  for (const [field, value] of Object.entries(where)) {
    if (value === undefined) continue
    if (field === 'AND' || field === 'OR') {
      if (!Array.isArray(value)) throw new Error('Invalid query filter')
      const nested = value.map((entry) => filterFor(table, entry))
      clauses.push(field === 'AND' ? and(...nested) : or(...nested))
      continue
    }
    const column = columns[field]
    if (!column) throw new Error('Invalid query field')
    if (value === null) {
      clauses.push(isNull(column))
    } else if (value instanceof Date || typeof value !== 'object') {
      clauses.push(eq(column, value))
    } else {
      const operators = value as Record<string, unknown>
      if (field === 'role' && typeof operators.name === 'string') clauses.push(eq(column, operators.name))
      else if ('not' in operators) clauses.push(ne(column, operators.not))
      else if ('gte' in operators) clauses.push(gte(column, operators.gte))
      else if (Array.isArray(operators.in)) clauses.push(inArray(column, operators.in))
      else if (typeof operators.contains === 'string') {
        const escaped = operators.contains.replace(/[\\%_]/g, '\\$&')
        clauses.push(ilike(column, `%${escaped}%`))
      } else throw new Error('Invalid query operator')
    }
  }
  return and(...clauses)
}

function project(record: Record<string, unknown>, selection?: Selection): Record<string, unknown> {
  if (!selection) return record
  return Object.fromEntries(Object.entries(selection).filter(([, selected]) => selected).map(([field, selected]) => {
    const value = record[field]
    return [field, typeof selected === 'object' && value && typeof value === 'object'
      ? project(value as Record<string, unknown>, selected.select)
      : value]
  }))
}

function repository<Table extends PgTable>(table: Table) {
  async function hydrate(rows: Record<string, unknown>[], options: QueryOptions): Promise<Result<Table>[]> {
    const relations = options.include ?? options.select ?? {}
    const subjectIds = [...new Set(rows.map((row) => row.subjectId).filter((value): value is string => typeof value === 'string'))]
    const authorIds = [...new Set(rows.map((row) => row.authorId).filter((value): value is string => typeof value === 'string'))]
    const postIds = rows.map((row) => String(row.id))
    const [subjects, authors, replyCounts] = await Promise.all([
      relations.subject && subjectIds.length ? getDatabase().select().from(schema.subjects).where(inArray(schema.subjects.id, subjectIds)) : [],
      relations.author && authorIds.length ? getDatabase().select({ id: schema.users.id, name: schema.users.name }).from(schema.users).where(inArray(schema.users.id, authorIds)) : [],
      relations._count && postIds.length ? getDatabase().select({ postId: schema.replies.postId, total: count() }).from(schema.replies).where(inArray(schema.replies.postId, postIds)).groupBy(schema.replies.postId) : [],
    ])
    const subjectMap = new Map(subjects.map((subject) => [subject.id, subject]))
    const authorMap = new Map(authors.map((author) => [author.id, author]))
    const countMap = new Map(replyCounts.map((reply) => [reply.postId, reply.total]))
    return rows.map((row) => {
      const record = { ...row }
      if ((table as PgTable) === schema.users && relations.role) record.role = { name: row.role }
      if (relations.subject) record.subject = subjectMap.get(String(row.subjectId)) ?? null
      if (relations.author) record.author = authorMap.get(String(row.authorId)) ?? null
      if (relations._count) record._count = { replies: countMap.get(String(row.id)) ?? 0 }
      for (const [field, selected] of Object.entries(relations)) {
        if (typeof selected === 'object' && record[field] && typeof record[field] === 'object') {
          record[field] = project(record[field] as Record<string, unknown>, selected.select)
        }
      }
      return project(record, options.select) as Result<Table>
    })
  }

  async function findMany(options: QueryOptions = {}): Promise<Result<Table>[]> {
    const columns = getTableColumns(table) as Record<string, PgColumn>
    const ordering = Object.entries(options.orderBy ?? {}).map(([field, direction]) => {
      if (!columns[field]) throw new Error('Invalid sort field')
      return direction === 'asc' ? asc(columns[field]) : desc(columns[field])
    })
    const query = getDatabase().select().from(table as PgTable).where(filterFor(table, options.where)).orderBy(...ordering).$dynamic()
    if (options.skip !== undefined) query.offset(options.skip)
    if (options.take !== undefined) query.limit(options.take)
    const rows = await query
    return hydrate(rows as Record<string, unknown>[], options)
  }

  async function findUnique(options: QueryOptions): Promise<Result<Table> | null> {
    const records = await findMany({ ...options, take: 1 })
    return records[0] ?? null
  }

  return {
    findMany,
    findUnique,
    async count(options: QueryOptions = {}) {
      const [record] = await getDatabase().select({ total: count() }).from(table as PgTable).where(filterFor(table, options.where))
      return record.total
    },
    async create(options: QueryOptions & { data: InferInsertModel<Table> }): Promise<Result<Table>> {
      const rows = await getDatabase().insert(table).values(options.data).returning()
      return (await hydrate(rows as Record<string, unknown>[], options))[0]
    },
    async createMany(options: { data: InferInsertModel<Table>[] }) {
      if (options.data.length) await getDatabase().insert(table).values(options.data)
    },
    async update(options: QueryOptions & { data: Partial<InferInsertModel<Table>> }): Promise<Result<Table>> {
      if (!options.where || !Object.keys(options.where).length) throw new Error('Update filter is required')
      const rows = await getDatabase().update(table).set(options.data).where(filterFor(table, options.where)).returning()
      if (!rows.length) throw new RecordNotFoundError()
      return (await hydrate(rows as Record<string, unknown>[], options))[0]
    },
    async updateMany(options: QueryOptions & { data: Partial<InferInsertModel<Table>> }) {
      if (!options.where || !Object.keys(options.where).length) throw new Error('Update filter is required')
      await getDatabase().update(table).set(options.data).where(filterFor(table, options.where))
    },
    async delete(options: QueryOptions) {
      if (!options.where || !Object.keys(options.where).length) throw new Error('Delete filter is required')
      const rows = await getDatabase().delete(table).where(filterFor(table, options.where)).returning()
      if (!rows.length) throw new RecordNotFoundError()
    },
  }
}

export const records = {
  user: repository(schema.users),
  subject: repository(schema.subjects),
  studyResource: repository(schema.resources),
  assignment: repository(schema.assignments),
  classSchedule: repository(schema.schedules),
  discussionPost: repository(schema.posts),
  discussionReply: repository(schema.replies),
  announcement: repository(schema.announcements),
  notification: repository(schema.notifications),
}
