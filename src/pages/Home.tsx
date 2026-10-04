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
      <section className="relative overflow-hidden border-b border-border-subtle bg-gradient-to-b from-emerald-50/80 via-white to-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 biotech-motif"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(56rem 28rem at 108% -20%, rgba(16, 185, 129, 0.12), transparent 60%), radial-gradient(44rem 24rem at -15% 120%, rgba(13, 148, 136, 0.10), transparent 55%), radial-gradient(30rem 18rem at 70% 115%, rgba(34, 211, 238, 0.08), transparent 60%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>
                <Badge variant="emerald" className="mb-4">Academic Year 2026</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 leading-tight tracking-tight animate-fade-up" style={{ animationDelay: '60ms' }}>
                Welcome to{' '}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'var(--gradient-brand)' }}
                >
                  Biotechnology
                </span>{' '}
                Section A
              </h1>
              <p
                className="text-base sm:text-lg text-neutral-600 mb-8 max-w-2xl leading-relaxed animate-fade-up"
                style={{ animationDelay: '120ms' }}
              >
                A shared space for learning, discussion, and academic growth. Access your courses, connect with peers, and track your progress.
              </p>
              <div
                className="flex flex-wrap gap-3 animate-fade-up"
                style={{ animationDelay: '180ms' }}
              >
                <Button variant="primary" size="lg" to="/subjects">
                  Get Started
                  <svg aria-hidden="true" className="ml-1.5 -mr-0.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0-5 5m5-5H6" />
                  </svg>
                </Button>
                <Button variant="outline" size="lg" to="/resources">
                  Browse Resources
                </Button>
              </div>
            </div>
            <div className="hidden lg:col-span-5 lg:flex lg:justify-end relative" aria-hidden="true">
              <span
                className="pointer-events-none absolute -bottom-10 -left-8 w-56 h-56 rounded-full blur-2xl opacity-70"
                style={{ background: 'var(--gradient-halo)' }}
              />
              <div className="relative w-full max-w-xl rounded-card border border-border-subtle bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/60 p-6 shadow-panel ring-1 ring-inset ring-teal-500/10 animate-drift">
                <svg viewBox="0 0 380 200" className="h-auto w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="316" cy="164" r="34" stroke="#d4d4d4" strokeWidth="1.5" strokeDasharray="4 6" />
                  <circle cx="64" cy="40" r="20" stroke="#a7f3d0" strokeWidth="1.5" />
                  <path d="M40 100 Q90 30 140 100 T240 100 T340 100" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                  <path d="M40 100 Q90 170 140 100 T240 100 T340 100" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
                  <path d="M90 65V140 M190 65V140 M290 65V140" stroke="#a7f3d0" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="90" cy="65" r="5.5" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
                  <circle cx="90" cy="140" r="5.5" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
                  <circle cx="190" cy="65" r="5.5" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
                  <circle cx="190" cy="140" r="5.5" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
                  <circle cx="290" cy="65" r="5.5" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
                  <circle cx="290" cy="140" r="5.5" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
                  <circle cx="40" cy="100" r="4" fill="#047857" />
                  <circle cx="140" cy="100" r="4" fill="#047857" />
                  <circle cx="240" cy="100" r="4" fill="#047857" />
                  <circle cx="340" cy="100" r="4" fill="#047857" />
                  <circle cx="330" cy="152" r="6" fill="#10b981" opacity="0.5" />
                  <circle cx="48" cy="52" r="5" fill="#14b8a6" opacity="0.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-tint border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="animate-reveal" style={{ animationDelay: '0ms' }}>
              <StatCard
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253" />
                  </svg>
                }
                label="Subjects"
                value={subjectCount === null ? '—' : String(subjectCount)}
                accent="emerald"
              />
            </div>
            <div className="animate-reveal" style={{ animationDelay: '60ms' }}>
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
            </div>
            <div className="animate-reveal" style={{ animationDelay: '120ms' }}>
              <StatCard
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                }
                label="Upcoming Assignments"
                value={areAssignmentsLoading ? '—' : String(upcomingAssignments.length)}
                accent="emerald"
              />
            </div>
            <div className="animate-reveal" style={{ animationDelay: '180ms' }}>
              <StatCard
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                label="Classes Today"
                value={isScheduleLoading ? '—' : String(todayClasses.length)}
                accent="teal"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader
          title="Quick Access"
          subtitle="Navigate to your academic resources"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {quickAccessItems.map((item, i) => (
            <div
              key={item.title}
              className="h-full animate-reveal"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <QuickAccessCard {...item} />
            </div>
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
              className="group inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-control"
            >
              View all
              <svg aria-hidden="true" className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          }
        />

        {areAssignmentsLoading && (
          <div className="space-y-3" role="status" aria-label="Loading">
            <span className="sr-only">Loading</span>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                aria-hidden="true"
                className="flex items-center gap-4 p-4 sm:p-5 bg-surface rounded-card border border-border-subtle shadow-card"
              >
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-shimmer" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3.5 w-2/5 rounded bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-shimmer" />
                  <div className="h-3 w-3/5 bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-shimmer" />
                </div>
                <div className="h-6 w-20 shrink-0 rounded-full bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-shimmer" />
              </div>
            ))}
          </div>
        )}

        {!areAssignmentsLoading && visibleAssignments.length === 0 && (
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 ring-1 ring-inset ring-neutral-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </span>
              <p className="text-sm text-neutral-500">There are no upcoming assignments right now.</p>
            </div>
          </Card>
        )}

        {!areAssignmentsLoading && visibleAssignments.length > 0 && (
          <div className="space-y-3">
            {visibleAssignments.map((assignment, i) => (
              <Link
                key={assignment.id}
                to={`/assignments/${assignment.id}`}
                style={{ animationDelay: `${i * 40}ms` }}
                className="group flex items-center gap-4 p-4 sm:p-5 bg-surface rounded-card border border-border-subtle shadow-card transition-all duration-200 ease-smooth hover:shadow-float hover:-translate-y-0.5 hover:border-emerald-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white animate-reveal"
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/10 transition-colors duration-200 group-hover:bg-emerald-100 group-hover:ring-emerald-600/20"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-neutral-900 truncate transition-colors duration-150 group-hover:text-emerald-700">{assignment.title}</p>
                  <p className="text-sm text-neutral-500 truncate mt-1">
                    {assignment.subject?.name || 'Subject'} · Due{' '}
                    {new Date(assignment.dueDate).toLocaleDateString()} {assignment.dueTime}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-2">
                  <AssignmentStatusBadge status={assignment.status} />
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-ink-muted transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
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
              className="group inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-control"
            >
              View all
              <svg aria-hidden="true" className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          }
        />

        {areDiscussionsLoading && (
          <div className="space-y-3" role="status" aria-label="Loading">
            <span className="sr-only">Loading</span>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                aria-hidden="true"
                className="flex items-center gap-4 p-4 sm:p-5 bg-surface rounded-card border border-border-subtle shadow-card"
              >
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-shimmer" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3.5 w-2/5 rounded bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-shimmer" />
                  <div className="h-3 w-1/3 bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-shimmer" />
                </div>
                <div className="h-6 w-16 shrink-0 rounded-full bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-shimmer" />
              </div>
            ))}
          </div>
        )}

        {!areDiscussionsLoading && recentDiscussions.length === 0 && (
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 ring-1 ring-inset ring-neutral-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </span>
              <p className="text-sm text-neutral-500">No discussions yet.</p>
            </div>
          </Card>
        )}

        {!areDiscussionsLoading && recentDiscussions.length > 0 && (
          <div className="space-y-3">
            {recentDiscussions.map((discussion, i) => (
              <Link
                key={discussion.id}
                to={`/discussions/${discussion.id}`}
                style={{ animationDelay: `${i * 40}ms` }}
                className="group flex items-center gap-4 p-4 sm:p-5 bg-surface rounded-card border border-border-subtle shadow-card transition-all duration-200 ease-smooth hover:shadow-float hover:-translate-y-0.5 hover:border-emerald-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white animate-reveal"
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-inset ring-teal-600/10 transition-colors duration-200 group-hover:bg-teal-100 group-hover:ring-teal-600/20"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-neutral-900 truncate transition-colors duration-150 group-hover:text-emerald-700">{discussion.title}</p>
                  <p className="text-sm text-neutral-500 truncate mt-1">
                    {discussion.subject?.name || 'Subject'} ·{' '}
                    {discussion.author?.name || 'Unknown'}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium tabular-nums text-neutral-600 ring-1 ring-inset ring-neutral-500/15 transition-colors duration-150 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:ring-emerald-600/15">
                    {discussion.replyCount}{' '}
                    {discussion.replyCount === 1 ? 'reply' : 'replies'}
                  </span>
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-ink-muted transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <SectionHeader
              title="Latest Announcements"
              subtitle="Official class notices"
              action={
                <Link
                  to="/announcements"
                  className="group inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-control"
                >
                  View all
                  <svg aria-hidden="true" className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              }
            />
            {areAnnouncementsLoading && (
              <div className="space-y-3" role="status" aria-label="Loading">
                <span className="sr-only">Loading</span>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    className="flex items-center gap-4 p-4 sm:p-5 bg-surface rounded-card border border-border-subtle shadow-card"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-1/3 rounded bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-shimmer" />
                        <div className="h-5 w-16 rounded-full bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-shimmer" />
                        <div className="h-5 w-14 rounded-full bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-shimmer" />
                      </div>
                      <div className="h-3 w-24 bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!areAnnouncementsLoading && latestAnnouncements.length === 0 && (
              <Card className="p-6">
                <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 ring-1 ring-inset ring-neutral-200"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </span>
                  <p className="text-sm text-neutral-500">No announcements yet.</p>
                </div>
              </Card>
            )}

            {!areAnnouncementsLoading && latestAnnouncements.length > 0 && (
              <div className="space-y-3">
                {latestAnnouncements.map((item, i) => (
                  <Link
                    key={item.id}
                    to={`/announcements/${item.id}`}
                    style={{ animationDelay: `${i * 40}ms` }}
                    className="group relative block overflow-hidden p-4 sm:p-5 bg-surface rounded-card border border-border-subtle shadow-card transition-all duration-200 ease-smooth hover:shadow-float hover:-translate-y-0.5 hover:border-emerald-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white animate-reveal"
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${
                        item.priority === 'URGENT'
                          ? 'from-red-500 to-red-400/40'
                          : item.priority === 'IMPORTANT'
                            ? 'from-amber-500 to-amber-400/40'
                            : 'from-emerald-500/70 to-emerald-400/25'
                      }`}
                    />
                    <div className="flex items-start gap-3 sm:gap-4">
                      <span
                        aria-hidden="true"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/15 transition-colors duration-200 group-hover:ring-cyan-600/30"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-neutral-900 truncate transition-colors duration-150 group-hover:text-emerald-700 min-w-0">{item.title}</p>
                          <AnnouncementTypeBadge type={item.type} />
                          <AnnouncementPriorityBadge priority={item.priority} />
                        </div>
                        <p className="text-xs text-neutral-500 mt-1.5">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 mt-0.5 text-ink-muted transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
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
                  className="group inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-control"
                >
                  Timetable
                  <svg aria-hidden="true" className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              }
            />
            <Card className="p-5">
              {isScheduleLoading && (
                <div className="flex items-center justify-center py-6 min-h-36">
                  <Spinner size="sm" label="Loading" />
                </div>
              )}

              {!isScheduleLoading && todayClasses.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-inset ring-teal-600/10"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <p className="text-sm text-neutral-500">No classes scheduled for today.</p>
                </div>
              )}

              {!isScheduleLoading && todayClasses.length > 0 && (
                <div className="space-y-1">
                  {todayClasses.map((cls, i) => (
                    <div
                      key={cls.id}
                      className="flex items-stretch gap-3 animate-reveal"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2 py-1 ring-1 ring-inset ring-emerald-600/15 tabular-nums whitespace-nowrap">
                          {cls.startTime}
                        </span>
                        <span
                          aria-hidden="true"
                          className="mt-2 w-2 h-2 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 ring-2 ring-emerald-100"
                        />
                        {i < todayClasses.length - 1 && (
                          <div className="w-px flex-1 mt-1.5 mb-4 bg-gradient-to-b from-emerald-400 via-neutral-200 to-transparent" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-4 pt-1">
                        <p className="font-semibold text-neutral-900 text-sm leading-snug">
                          {cls.subject?.name ?? 'Class'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
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
