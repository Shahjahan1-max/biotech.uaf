import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { SectionHeader } from '../components/SectionHeader'
import { StatCard } from '../components/StatCard'
import { QuickAccessCard } from '../components/QuickAccessCard'
import { AssignmentStatusBadge } from '../components/AssignmentStatusBadge'
import { listAssignments } from '../services/assignments'
import { listSchedule } from '../services/schedule'
import { listDiscussions } from '../services/discussions'
import { listAnnouncements } from '../services/announcements'
import { AnnouncementPriorityBadge } from '../components/AnnouncementPriorityBadge'
import { AnnouncementTypeBadge } from '../components/AnnouncementTypeBadge'
import { Spinner } from '../components/Spinner'
import { getSubjects } from '../services/subjects'
import { getResources } from '../services/resources'
import { timeRange, todayDayOfWeek } from '../utils/schedule'
import type { Assignment } from '../types/assignment'
import type { ClassSchedule } from '../types/schedule'
import type { DiscussionPost } from '../types/discussion'
import type { Announcement } from '../types/announcement'

const quickAccessItems = [
  {
    title: 'Subjects',
    href: '/subjects',
    description: 'Explore your biotechnology subjects and course modules.',
    accent: 'emerald' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Notes',
    href: '/resources',
    description: 'Access lecture notes, study guides, and reference materials.',
    accent: 'teal' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Assignments',
    href: '/assignments',
    description: 'View, submit, and track your assignments and lab reports.',
    accent: 'emerald' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Timetable',
    href: '/timetable',
    description: 'Check your class schedule and upcoming sessions.',
    accent: 'teal' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Discussion',
    href: '/discussions',
    description: 'Engage with classmates and instructors in discussions.',
    accent: 'emerald' as const,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
]

export function Home() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [areAssignmentsLoading, setAreAssignmentsLoading] = useState(true)
  const [todayClasses, setTodayClasses] = useState<ClassSchedule[]>([])
  const [isScheduleLoading, setIsScheduleLoading] = useState(true)
  const [recentDiscussions, setRecentDiscussions] = useState<DiscussionPost[]>([])
  const [areDiscussionsLoading, setAreDiscussionsLoading] = useState(true)
  const [latestAnnouncements, setLatestAnnouncements] = useState<Announcement[]>([])
  const [areAnnouncementsLoading, setAreAnnouncementsLoading] = useState(true)
  const [subjectCount, setSubjectCount] = useState<number | null>(null)
  const [resourceCount, setResourceCount] = useState<number | null>(null)

  useEffect(() => {
    getSubjects()
      .then((items) => setSubjectCount(items.length))
      .catch(() => setSubjectCount(null))
  }, [])

  useEffect(() => {
    getResources()
      .then((items) => setResourceCount(items.length))
      .catch(() => setResourceCount(null))
  }, [])

  useEffect(() => {
    listAssignments()
      .then(setAssignments)
      .catch(() => setAssignments([]))
      .finally(() => setAreAssignmentsLoading(false))
  }, [])

  useEffect(() => {
    const today = todayDayOfWeek()
    listSchedule({ day: today })
      .then(setTodayClasses)
      .catch(() => setTodayClasses([]))
      .finally(() => setIsScheduleLoading(false))
  }, [])

  useEffect(() => {
    listDiscussions({ limit: 5 })
      .then((data) => setRecentDiscussions(data.items))
      .catch(() => setRecentDiscussions([]))
      .finally(() => setAreDiscussionsLoading(false))
  }, [])

  useEffect(() => {
    listAnnouncements({ limit: 5 })
      .then((data) => setLatestAnnouncements(data.items))
      .catch(() => setLatestAnnouncements([]))
      .finally(() => setAreAnnouncementsLoading(false))
  }, [])

  const upcomingAssignments = assignments.filter((assignment) => assignment.status !== 'OVERDUE')
  const visibleAssignments = upcomingAssignments.slice(0, 4)

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-white to-white border-b border-neutral-200">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <Badge variant="emerald" className="mb-4">Academic Year 2026</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 leading-tight">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Biotechnology
              </span>
              <br />
              Section A
            </h1>
            <p className="text-lg text-neutral-600 mb-8 max-w-2xl leading-relaxed">
              A shared space for learning, discussion, and academic growth. Access your courses, connect with peers, and track your progress.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="lg" to="/subjects">
                Get Started
              </Button>
              <Button variant="outline" size="lg" to="/resources">
                Browse Resources
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            label="Subjects"
            value={subjectCount === null ? '—' : String(subjectCount)}
            accent="emerald"
          />
          <StatCard
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            label="Study Resources"
            value={resourceCount === null ? '—' : String(resourceCount)}
            accent="teal"
          />
          <StatCard
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            label="Upcoming Assignments"
            value={areAssignmentsLoading ? '—' : String(upcomingAssignments.length)}
            accent="emerald"
          />
          <StatCard
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            label="Classes Today"
            value={isScheduleLoading ? '—' : String(todayClasses.length)}
            accent="teal"
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader
          title="Quick Access"
          subtitle="Navigate to your academic resources"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickAccessItems.map((item) => (
            <QuickAccessCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader
          title="Upcoming Assignments"
          subtitle="Deadlines you need to meet"
          action={
            <Link
              to="/assignments"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all
            </Link>
          }
        />

        {areAssignmentsLoading && (
          <div className="flex items-center justify-center py-10">
            <Spinner label="Loading" />
          </div>
        )}

        {!areAssignmentsLoading && visibleAssignments.length === 0 && (
          <Card className="p-6">
            <p className="text-sm text-neutral-500">There are no upcoming assignments right now.</p>
          </Card>
        )}

        {!areAssignmentsLoading && visibleAssignments.length > 0 && (
          <div className="space-y-3">
            {visibleAssignments.map((assignment) => (
              <Link
                key={assignment.id}
                to={`/assignments/${assignment.id}`}
                className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900 truncate">{assignment.title}</p>
                  <p className="text-sm text-neutral-500 truncate">
                    {assignment.subject?.name || 'Subject'} · Due{' '}
                    {new Date(assignment.dueDate).toLocaleDateString()} {assignment.dueTime}
                  </p>
                </div>
                <AssignmentStatusBadge status={assignment.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader
          title="Recent Discussions"
          subtitle="Latest conversations from your classmates"
          action={
            <Link
              to="/discussions"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all
            </Link>
          }
        />

        {areDiscussionsLoading && (
          <div className="flex items-center justify-center py-10">
            <Spinner label="Loading" />
          </div>
        )}

        {!areDiscussionsLoading && recentDiscussions.length === 0 && (
          <Card className="p-6">
            <p className="text-sm text-neutral-500">No discussions yet.</p>
          </Card>
        )}

        {!areDiscussionsLoading && recentDiscussions.length > 0 && (
          <div className="space-y-3">
            {recentDiscussions.map((discussion) => (
              <Link
                key={discussion.id}
                to={`/discussions/${discussion.id}`}
                className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900 truncate">{discussion.title}</p>
                  <p className="text-sm text-neutral-500 truncate">
                    {discussion.subject?.name || 'Subject'} ·{' '}
                    {discussion.author?.name || 'Unknown'}
                  </p>
                </div>
                <span className="flex-shrink-0 text-xs text-neutral-500">
                  {discussion.replyCount}{' '}
                  {discussion.replyCount === 1 ? 'reply' : 'replies'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SectionHeader
              title="Latest Announcements"
              subtitle="Official class notices"
              action={
                <Link
                  to="/announcements"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  View all
                </Link>
              }
            />
            {areAnnouncementsLoading && (
              <div className="flex items-center justify-center py-10">
                <Spinner label="Loading" />
              </div>
            )}

            {!areAnnouncementsLoading && latestAnnouncements.length === 0 && (
              <Card className="p-6">
                <p className="text-sm text-neutral-500">No announcements yet.</p>
              </Card>
            )}

            {!areAnnouncementsLoading && latestAnnouncements.length > 0 && (
              <div className="space-y-3">
                {latestAnnouncements.map((item) => (
                  <Link
                    key={item.id}
                    to={`/announcements/${item.id}`}
                    className="block p-4 bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-medium text-neutral-900 truncate">{item.title}</p>
                      <AnnouncementTypeBadge type={item.type} />
                      <AnnouncementPriorityBadge priority={item.priority} />
                    </div>
                    <p className="text-sm text-neutral-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <SectionHeader
              title="Today's Classes"
              subtitle="Your schedule for today"
              action={
                <Link
                  to="/timetable"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Timetable
                </Link>
              }
            />
            <Card className="p-5">
              {isScheduleLoading && (
                <div className="flex items-center justify-center py-6">
                  <Spinner size="sm" label="Loading" />
                </div>
              )}

              {!isScheduleLoading && todayClasses.length === 0 && (
                <p className="text-sm text-neutral-500">No classes scheduled for today.</p>
              )}

              {!isScheduleLoading && todayClasses.length > 0 && (
                <div className="space-y-4">
                  {todayClasses.map((cls, i) => (
                    <div key={cls.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-emerald-600">{cls.startTime}</span>
                        {i < todayClasses.length - 1 && (
                          <div className="w-px h-full bg-neutral-200 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-neutral-900 text-sm">
                          {cls.subject?.name ?? 'Class'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {cls.room} · {timeRange(cls.startTime, cls.endTime)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
