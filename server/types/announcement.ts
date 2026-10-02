export const ANNOUNCEMENT_TYPES = [
  'GENERAL',
  'ASSIGNMENT',
  'QUIZ',
  'EXAM',
  'LECTURE',
  'SCHEDULE',
  'RESOURCE',
  'OTHER',
] as const

export type AnnouncementType = (typeof ANNOUNCEMENT_TYPES)[number]

export const ANNOUNCEMENT_PRIORITIES = ['NORMAL', 'IMPORTANT', 'URGENT'] as const

export type AnnouncementPriority = (typeof ANNOUNCEMENT_PRIORITIES)[number]

export interface AnnouncementAuthor {
  id: string
  name: string
}

export interface AnnouncementSubject {
  id: string
  name: string
  code: string
}

export interface AnnouncementInput {
  title: string
  content: string
  type: AnnouncementType
  priority: AnnouncementPriority
  subjectId?: string | null
  expiresAt?: Date | null
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: AnnouncementType
  priority: AnnouncementPriority
  subjectId: string | null
  subject?: AnnouncementSubject | null
  authorId: string
  author?: AnnouncementAuthor
  expiresAt: Date | null
  isExpired: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AnnouncementListFilters {
  subjectId?: string
  type?: string
  priority?: string
  search?: string
  includeExpired?: boolean
  page?: number
  limit?: number
}

export interface PaginatedAnnouncements {
  items: Announcement[]
  page: number
  limit: number
  total: number
  totalPages: number
}
