import type { AnnouncementType, AnnouncementPriority } from './announcement'

export interface AdminStats {
  students: number
  subjects: number
  assignments: number
  resources: number
  announcements: number
  discussions: number
}

export interface DashboardSubjectRef {
  id: string
  name: string
  code: string
}

export interface DashboardAnnouncement {
  id: string
  title: string
  type: AnnouncementType
  priority: AnnouncementPriority
  createdAt: string
  subject: DashboardSubjectRef | null
}

export interface DashboardAssignment {
  id: string
  title: string
  dueDate: string
  createdAt: string
  subject: DashboardSubjectRef | null
}

export interface DashboardResource {
  id: string
  title: string
  resourceType: string
  createdAt: string
  subject: DashboardSubjectRef | null
}

export interface DashboardDiscussion {
  id: string
  title: string
  createdAt: string
  authorName: string
  replyCount: number
  subject: DashboardSubjectRef | null
}

export interface AdminDashboardData {
  stats: AdminStats
  recent: {
    announcements: DashboardAnnouncement[]
    assignments: DashboardAssignment[]
    resources: DashboardResource[]
    discussions: DashboardDiscussion[]
  }
}

export interface AdminStudent {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export interface AdminStudentFilters {
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedAdminStudents {
  items: AdminStudent[]
  page: number
  limit: number
  total: number
  totalPages: number
}
