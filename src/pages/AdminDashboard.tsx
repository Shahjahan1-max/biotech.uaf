import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { SectionHeader } from '../components/SectionHeader'
import { StatCard } from '../components/StatCard'
import { Button } from '../components/Button'
import { Spinner } from '../components/Spinner'
import { FounderSettingsForm } from '../components/FounderSettingsForm'
import { GeneralAnnouncementsPanel } from '../components/GeneralAnnouncementsPanel'
import { AnnouncementPriorityBadge } from '../components/AnnouncementPriorityBadge'
import { AnnouncementTypeBadge } from '../components/AnnouncementTypeBadge'
import { useAuth } from '../hooks/useAuth'
import { getAdminDashboard } from '../services/admin'
import { getUnreadCount } from '../services/notifications'
import type { AdminDashboardData } from '../types/admin'

const icons = {
  students: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  subjects: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  assignments: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  resources: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  announcements: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M5 10.5V4.5a1.5 1.5 0 011.5-1.5h4.5M18 10.5v8.647a1.76 1.76 0 01-3.417.592l-2.147-6.15M13.5 10.5h4.5A1.5 1.5 0 0019.5 9V4.5A1.5 1.5 0 0018 3H6a1.5 1.5 0 00-1.5 1.5v6" />
    </svg>
  ),
  discussions: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
  ),
}

const quickActions = [
  { title: 'Manage Subjects', description: 'Create and edit course subjects.', href: '/subjects', icon: icons.subjects, accent: 'emerald' as const },
  { title: 'Manage Assignments', description: 'Post deadlines and lab reports.', href: '/assignments', icon: icons.assignments, accent: 'teal' as const },
  { title: 'Manage Resources', description: 'Upload notes and study guides.', href: '/resources', icon: icons.resources, accent: 'emerald' as const },
  { title: 'Manage Timetable', description: 'Schedule classes and rooms.', href: '/timetable', icon: icons.assignments, accent: 'teal' as const },
  { title: 'Manage Discussions', description: 'Moderate student discussions.', href: '/discussions', icon: icons.discussions, accent: 'emerald' as const },
  { title: 'Manage Announcements', description: 'Publish official class notices.', href: '/announcements', icon: icons.announcements, accent: 'teal' as const },
  { title: 'Manage Students', description: 'View registered student accounts.', href: '/admin/students', icon: icons.students, accent: 'emerald' as const },
]

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString()
}

export function AdminDashboard() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let active = true

    getAdminDashboard()
      .then((data) => {
        if (active) setDashboard(data)
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load dashboard.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    getUnreadCount()
      .then((data) => {
        if (active) setUnreadCount(data.count)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner label="Loading dashboard" />
          <p className="text-sm text-neutral-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Error Loading Dashboard</h3>
          <p className="text-sm text-neutral-500">{error || 'Unable to load dashboard.'}</p>
        </div>
      </div>
    )
  }

  const { stats, recent } = dashboard
  const hasRecentActivity =
    recent.announcements.length > 0 ||
    recent.assignments.length > 0 ||
    recent.resources.length > 0 ||
    recent.discussions.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader
        as="h1"
        title="Admin Dashboard"
        subtitle={`Welcome back${user?.name ? `, ${user.name}` : ''} — manage the Biotechnology Section A portal`}
        action={
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              Notifications{unreadCount > 0 ? ` (${unreadCount} unread)` : ''}
            </Link>
            <Button variant="outline" to="/admin/students">Manage Students</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={icons.students} label="Total Students" value={stats.students} accent="emerald" />
        <StatCard icon={icons.subjects} label="Total Subjects" value={stats.subjects} accent="teal" />
        <StatCard icon={icons.assignments} label="Total Assignments" value={stats.assignments} accent="emerald" />
        <StatCard icon={icons.resources} label="Total Study Resources" value={stats.resources} accent="teal" />
        <StatCard icon={icons.announcements} label="Total Announcements" value={stats.announcements} accent="emerald" />
        <StatCard icon={icons.discussions} label="Total Discussion Posts" value={stats.discussions} accent="teal" />
      </div>

      <section className="mb-8">
        <SectionHeader title="Quick Actions" subtitle="Jump straight to portal management" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className="block p-5 bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    action.accent === 'emerald'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-teal-50 text-teal-600'
                  }`}
                >
                  {action.icon}
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm">{action.title}</h3>
              </div>
              <p className="text-xs text-neutral-500">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <SectionHeader
          title="Recent Activity"
          subtitle="The latest additions across the portal"
        />

        {!hasRecentActivity && (
          <Card className="p-6">
            <p className="text-sm text-neutral-500">No recent activity yet.</p>
          </Card>
        )}

        {hasRecentActivity && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
                Announcements
              </h3>
              {recent.announcements.length === 0 ? (
                <p className="text-sm text-neutral-500">No announcements yet.</p>
              ) : (
                <div className="space-y-3">
                  {recent.announcements.map((item) => (
                    <Link
                      key={item.id}
                      to={`/announcements/${item.id}`}
                      className="block group"
                    >
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <AnnouncementTypeBadge type={item.type} />
                        <AnnouncementPriorityBadge priority={item.priority} />
                      </div>
                      <p className="text-sm font-medium text-neutral-900 group-hover:text-emerald-700 truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {item.subject ? `${item.subject.code} · ` : ''}
                        {formatDate(item.createdAt)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
                Assignments
              </h3>
              {recent.assignments.length === 0 ? (
                <p className="text-sm text-neutral-500">No assignments yet.</p>
              ) : (
                <div className="space-y-3">
                  {recent.assignments.map((item) => (
                    <Link
                      key={item.id}
                      to={`/assignments/${item.id}`}
                      className="block group"
                    >
                      <p className="text-sm font-medium text-neutral-900 group-hover:text-emerald-700 truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {item.subject ? `${item.subject.code} · ` : ''}
                        Due {formatDate(item.dueDate)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
                Resources
              </h3>
              {recent.resources.length === 0 ? (
                <p className="text-sm text-neutral-500">No resources yet.</p>
              ) : (
                <div className="space-y-3">
                  {recent.resources.map((item) => (
                    <div key={item.id}>
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {item.subject ? `${item.subject.code} · ` : ''}
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
                Discussions
              </h3>
              {recent.discussions.length === 0 ? (
                <p className="text-sm text-neutral-500">No discussions yet.</p>
              ) : (
                <div className="space-y-3">
                  {recent.discussions.map((item) => (
                    <Link
                      key={item.id}
                      to={`/discussions/${item.id}`}
                      className="block group"
                    >
                      <p className="text-sm font-medium text-neutral-900 group-hover:text-emerald-700 truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {item.authorName} · {item.replyCount}{' '}
                        {item.replyCount === 1 ? 'reply' : 'replies'} ·{' '}
                        {formatDate(item.createdAt)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </section>

      <GeneralAnnouncementsPanel />

      <section className="mb-8">
        <SectionHeader
          title="Founder / Website Footer"
          subtitle="Control the founder name and photo shown in the global footer"
        />
        <FounderSettingsForm />
      </section>

      <section>
        <Card className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-neutral-900">Student Management</h3>
            <p className="text-sm text-neutral-500 mt-1">
              View registered accounts, search by name or email, and review registration dates.
            </p>
          </div>
          <Button variant="primary" to="/admin/students">Open Student List</Button>
        </Card>
      </section>
    </div>
  )
}
