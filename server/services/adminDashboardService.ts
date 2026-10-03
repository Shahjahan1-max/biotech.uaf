import { prisma } from '../utils/prisma.js'


const RECENT_LIMIT = 5

export interface DashboardStats {
  students: number
  subjects: number
  assignments: number
  resources: number
  announcements: number
  discussions: number
}

export interface DashboardAnnouncement {
  id: string
  title: string
  type: string
  priority: string
  createdAt: Date
  subject: { id: string; name: string; code: string } | null
}

export interface DashboardAssignment {
  id: string
  title: string
  dueDate: Date
  createdAt: Date
  subject: { id: string; name: string; code: string } | null
}

export interface DashboardResource {
  id: string
  title: string
  resourceType: string
  createdAt: Date
  subject: { id: string; name: string; code: string } | null
}

export interface DashboardDiscussion {
  id: string
  title: string
  createdAt: Date
  authorName: string
  replyCount: number
  subject: { id: string; name: string; code: string } | null
}

export interface AdminDashboardData {
  stats: DashboardStats
  recent: {
    announcements: DashboardAnnouncement[]
    assignments: DashboardAssignment[]
    resources: DashboardResource[]
    discussions: DashboardDiscussion[]
  }
}

const subjectSelect = { id: true, name: true, code: true } as const

export async function getDashboard(): Promise<AdminDashboardData> {
  const now = new Date()

  const [
    students,
    subjects,
    assignments,
    resources,
    announcements,
    discussions,
    recentAnnouncements,
    recentAssignments,
    recentResources,
    recentDiscussions,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { name: 'STUDENT' } } }),
    prisma.subject.count(),
    prisma.assignment.count(),
    prisma.studyResource.count(),
    prisma.announcement.count({
      where: { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
    }),
    prisma.discussionPost.count(),
    prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: RECENT_LIMIT,
      select: {
        id: true,
        title: true,
        type: true,
        priority: true,
        createdAt: true,
        subject: { select: subjectSelect },
      },
    }),
    prisma.assignment.findMany({
      orderBy: { createdAt: 'desc' },
      take: RECENT_LIMIT,
      select: {
        id: true,
        title: true,
        dueDate: true,
        createdAt: true,
        subject: { select: subjectSelect },
      },
    }),
    prisma.studyResource.findMany({
      orderBy: { createdAt: 'desc' },
      take: RECENT_LIMIT,
      select: {
        id: true,
        title: true,
        resourceType: true,
        createdAt: true,
        subject: { select: subjectSelect },
      },
    }),
    prisma.discussionPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: RECENT_LIMIT,
      select: {
        id: true,
        title: true,
        createdAt: true,
        subject: { select: subjectSelect },
        author: { select: { name: true } },
        _count: { select: { replies: true } },
      },
    }),
  ])

  return {
    stats: {
      students,
      subjects,
      assignments,
      resources,
      announcements,
      discussions,
    },
    recent: {
      announcements: recentAnnouncements.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        priority: item.priority,
        createdAt: item.createdAt,
        subject: item.subject,
      })),
      assignments: recentAssignments.map((item) => ({
        id: item.id,
        title: item.title,
        dueDate: item.dueDate,
        createdAt: item.createdAt,
        subject: item.subject,
      })),
      resources: recentResources.map((item) => ({
        id: item.id,
        title: item.title,
        resourceType: item.resourceType,
        createdAt: item.createdAt,
        subject: item.subject,
      })),
      discussions: recentDiscussions.map((item) => ({
        id: item.id,
        title: item.title,
        createdAt: item.createdAt,
        authorName: item.author.name,
        replyCount: item._count.replies,
        subject: item.subject,
      })),
    },
  }
}
