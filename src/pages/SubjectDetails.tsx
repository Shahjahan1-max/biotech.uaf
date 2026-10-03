import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { ResourceTypeBadge } from '../components/ResourceTypeBadge'
import { AssignmentStatusBadge } from '../components/AssignmentStatusBadge'
import { getSubject } from '../services/subjects'
import { getResources } from '../services/resources'
import { resolveUploadUrl } from '../services/uploads'
import { listAssignments } from '../services/assignments'
import { listSchedule } from '../services/schedule'
import { listDiscussions } from '../services/discussions'
import { listAnnouncements } from '../services/announcements'
import { AnnouncementPriorityBadge } from '../components/AnnouncementPriorityBadge'
import { AnnouncementTypeBadge } from '../components/AnnouncementTypeBadge'
import { DAY_LABELS, timeRange } from '../utils/schedule'
import type { Subject } from '../types/subject'
import type { StudyResource } from '../types/resource'
import type { Assignment } from '../types/assignment'
import type { ClassSchedule } from '../types/schedule'
import type { DiscussionPost } from '../types/discussion'
import type { Announcement } from '../types/announcement'

export function SubjectDetails() {
  const { id } = useParams<{ id: string }>()
  return <SubjectDetailsContent key={id} id={id} />
}

function SubjectDetailsContent({ id }: { id?: string }) {
  const [subject, setSubject] = useState<Subject | null>(null)
  const [resources, setResources] = useState<StudyResource[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classSchedule, setClassSchedule] = useState<ClassSchedule[]>([])
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(id))
  const [error, setError] = useState(id ? '' : 'The requested subject could not be found.')

  useEffect(() => {
    if (!id) return

    Promise.all([
      getSubject(id),
      getResources(id),
      listAssignments(id),
      listSchedule({ subjectId: id }),
      listDiscussions({ subjectId: id, limit: 5 }),
      listAnnouncements({ subjectId: id, limit: 5 }),
    ])
      .then(([subjectData, resourcesData, assignmentsData, scheduleData, discussionsData, announcementsData]) => {
        setSubject(subjectData)
        setResources(resourcesData)
        setAssignments(assignmentsData)
        setClassSchedule(scheduleData)
        setDiscussions(discussionsData.items)
        setAnnouncements(announcementsData.items)
      })
      .catch(() => setError('Failed to load subject'))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="status"
        aria-label="Loading subject"
      >
        <span className="sr-only">Loading subject</span>
        <div aria-hidden="true" className="space-y-6 animate-pulse">
          <div className="h-5 w-32 rounded bg-neutral-200/70" />
          <div className="p-6 sm:p-8 bg-surface rounded-card border border-border-subtle shadow-card">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-12 h-12 shrink-0 rounded-control bg-neutral-200/70" />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="h-7 w-48 rounded bg-neutral-200/70" />
                  <div className="h-5 w-20 rounded-full bg-neutral-100" />
                </div>
                <div className="h-3.5 w-3/4 rounded bg-neutral-100" />
                <div className="h-3.5 w-1/2 rounded bg-neutral-100" />
                <div className="h-3 w-28 rounded bg-neutral-200/70" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-surface rounded-card border border-border-subtle shadow-card space-y-3">
              <div className="h-4 w-24 rounded bg-neutral-200/70" />
              <div className="h-3.5 w-1/2 rounded bg-neutral-100" />
              <div className="h-3.5 w-1/3 rounded bg-neutral-100" />
            </div>
            <div className="p-6 bg-surface rounded-card border border-border-subtle shadow-card space-y-3">
              <div className="h-4 w-36 rounded bg-neutral-200/70" />
              <div className="h-3.5 w-3/4 rounded bg-neutral-100" />
              <div className="h-3.5 w-2/3 rounded bg-neutral-100" />
            </div>
          </div>
          <div className="p-6 bg-surface rounded-card border border-border-subtle shadow-card space-y-3">
            <div className="h-4 w-40 rounded bg-neutral-200/70" />
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 bg-surface rounded-card border border-border-subtle shadow-card"
              >
                <div className="w-9 h-9 shrink-0 rounded-control bg-neutral-200/70" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded bg-neutral-200/70" />
                  <div className="h-3 w-1/2 rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-surface rounded-card border border-border-subtle shadow-card space-y-3">
            <div className="h-4 w-32 rounded bg-neutral-200/70" />
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 bg-surface rounded-card border border-border-subtle shadow-card"
              >
                <div className="w-10 h-10 shrink-0 rounded-control bg-neutral-200/70" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3.5 w-2/5 rounded bg-neutral-200/70" />
                  <div className="h-3 w-1/3 rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-surface rounded-card border border-border-subtle shadow-card space-y-3">
              <div className="h-4 w-32 rounded bg-neutral-200/70" />
              <div className="h-3.5 w-2/3 rounded bg-neutral-100" />
              <div className="h-3.5 w-1/2 rounded bg-neutral-100" />
            </div>
            <div className="p-6 bg-surface rounded-card border border-border-subtle shadow-card space-y-3">
              <div className="h-4 w-40 rounded bg-neutral-200/70" />
              <div className="h-3.5 w-3/5 rounded bg-neutral-100" />
              <div className="h-3.5 w-2/5 rounded bg-neutral-100" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !subject) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface rounded-card border border-border-subtle shadow-card p-6">
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500 ring-1 ring-inset ring-red-600/20"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </span>
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-1">Subject Not Found</h3>
              <p className="text-sm text-neutral-500 mb-4">{error || 'The requested subject could not be found.'}</p>
            </div>
            <Link
              to="/subjects"
              className="group inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-control"
            >
              <svg
                aria-hidden="true"
                className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Subjects
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/subjects"
        className="group inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors duration-150 mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-control"
      >
        <svg
          aria-hidden="true"
          className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Subjects
      </Link>

      <div className="bg-surface rounded-card border border-border-subtle shadow-card p-6 sm:p-8">
        <div className="flex items-start gap-4 sm:gap-5">
          <span
            aria-hidden="true"
            className="w-12 h-12 shrink-0 rounded-control flex items-center justify-center bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-ink-strong tracking-tight leading-tight min-w-0">
                {subject.name}
              </h1>
              <Badge variant="emerald">{subject.code}</Badge>
            </div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mt-4">Description</p>
            <p className="text-sm sm:text-base text-ink leading-relaxed mt-1.5">
              {subject.description || 'No description available for this subject.'}
            </p>
            <p className="text-xs text-ink-muted mt-3">
              Added {new Date(subject.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface rounded-card border border-border-subtle shadow-card p-6">
            <h2 className="text-sm font-semibold text-ink-strong uppercase tracking-wide mb-4">Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-ink-muted uppercase tracking-wide">Subject Code</dt>
                <dd className="text-sm font-medium text-ink-strong mt-1">{subject.code}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted uppercase tracking-wide">Added</dt>
                <dd className="text-sm font-medium text-ink-strong mt-1">
                  {new Date(subject.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-surface rounded-card border border-border-subtle shadow-card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-semibold text-ink-strong uppercase tracking-wide">Class Schedule</h2>
              <Link
                to="/timetable"
                className="group inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-control"
              >
                Full timetable
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {classSchedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center rounded-card border border-dashed border-border-subtle bg-surface-soft px-4">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 ring-1 ring-inset ring-neutral-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <p className="text-sm text-ink-muted">No classes are scheduled for this subject.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-ink-muted border-b border-border-subtle">
                      <th className="py-2 pr-4 font-medium">Day</th>
                      <th className="py-2 pr-4 font-medium">Time</th>
                      <th className="py-2 pr-4 font-medium">Instructor</th>
                      <th className="py-2 font-medium">Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classSchedule.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-border-subtle last:border-0 transition-colors duration-150 hover:bg-surface-soft"
                      >
                        <td className="py-3 pr-4 font-medium text-ink-strong">
                          {DAY_LABELS[entry.dayOfWeek]}
                        </td>
                        <td className="py-3 pr-4 text-ink">
                          {timeRange(entry.startTime, entry.endTime)}
                        </td>
                        <td className="py-3 pr-4 text-ink">{entry.instructor}</td>
                        <td className="py-3 text-ink">{entry.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface rounded-card border border-border-subtle shadow-card p-6">
          <h2 className="text-sm font-semibold text-ink-strong uppercase tracking-wide mb-4">Study Resources</h2>
          {resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-center rounded-card border border-dashed border-border-subtle bg-surface-soft px-4">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 ring-1 ring-inset ring-neutral-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <p className="text-sm text-ink-muted">No study resources have been added yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((resource) => {
                const resourceUrl = resource.url
                  ? resolveUploadUrl(resource.url)
                  : resource.filePath
                    ? resolveUploadUrl(resource.filePath)
                    : null

                return (
                  <div
                    key={resource.id}
                    className="flex items-center gap-4 p-4 bg-surface rounded-card border border-border-subtle shadow-card transition-all duration-200 ease-smooth hover:border-emerald-200/70 hover:shadow-float"
                  >
                    <span
                      aria-hidden="true"
                      className="w-9 h-9 shrink-0 rounded-control flex items-center justify-center bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/10"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 min-w-0">
                        <h3 className="font-medium text-neutral-900 text-sm truncate min-w-0">{resource.title}</h3>
                        <span className="shrink-0">
                          <ResourceTypeBadge type={resource.resourceType} />
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted truncate">
                        {resource.description || 'No description'}
                      </p>
                    </div>
                    {resourceUrl ? (
                      <a
                        href={resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 shrink-0 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-control"
                      >
                        Open
                        <svg
                          aria-hidden="true"
                          className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="ml-4 shrink-0 text-sm text-ink-muted">No link</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-surface rounded-card border border-border-subtle shadow-card p-6">
          <h2 className="text-sm font-semibold text-ink-strong uppercase tracking-wide mb-4">Assignments</h2>
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-center rounded-card border border-dashed border-border-subtle bg-surface-soft px-4">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 ring-1 ring-inset ring-neutral-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </span>
              <p className="text-sm text-ink-muted">No assignments have been created yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  to={`/assignments/${assignment.id}`}
                  className="group flex items-center gap-4 p-4 bg-surface rounded-card border border-border-subtle shadow-card transition-all duration-200 ease-smooth hover:shadow-float hover:-translate-y-0.5 hover:border-emerald-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <span
                    aria-hidden="true"
                    className="w-10 h-10 shrink-0 rounded-control flex items-center justify-center bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/10 transition-colors duration-200 group-hover:bg-emerald-100 group-hover:ring-emerald-600/20"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0 mt-auto">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="font-medium text-neutral-900 text-sm truncate min-w-0 transition-colors duration-150 group-hover:text-emerald-700">
                        {assignment.title}
                      </h3>
                      <span className="shrink-0">
                        <AssignmentStatusBadge status={assignment.status} />
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted truncate mt-1">
                      Due {new Date(assignment.dueDate).toLocaleDateString()}{' '}
                      {assignment.dueTime}
                    </p>
                  </div>
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 shrink-0 text-neutral-400 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface rounded-card border border-border-subtle shadow-card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-semibold text-ink-strong uppercase tracking-wide">Discussions</h2>
              <Link
                to={`/discussions?subjectId=${subject.id}`}
                className="group inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-control"
              >
                View all discussions
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {discussions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center rounded-card border border-dashed border-border-subtle bg-surface-soft px-4">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 ring-1 ring-inset ring-neutral-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </span>
                <p className="text-sm text-ink-muted">No discussions have been started yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {discussions.map((discussion) => (
                  <Link
                    key={discussion.id}
                    to={`/discussions/${discussion.id}`}
                    className="group flex items-center gap-4 p-4 bg-surface rounded-card border border-border-subtle shadow-card transition-all duration-200 ease-smooth hover:shadow-float hover:-translate-y-0.5 hover:border-emerald-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <span
                      aria-hidden="true"
                      className="w-10 h-10 shrink-0 rounded-control flex items-center justify-center bg-teal-50 text-teal-600 ring-1 ring-inset ring-teal-600/10 transition-colors duration-200 group-hover:bg-teal-100 group-hover:ring-teal-600/20"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-neutral-900 text-sm truncate transition-colors duration-150 group-hover:text-emerald-700">
                        {discussion.title}
                      </h3>
                      <p className="text-xs text-ink-muted truncate mt-1">
                        {discussion.author?.name || 'Unknown'} ·{' '}
                        {new Date(discussion.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="shrink-0 flex items-center gap-2">
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium tabular-nums text-neutral-600 ring-1 ring-inset ring-neutral-500/15 transition-colors duration-150 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:ring-emerald-600/15">
                        {discussion.replyCount}{' '}
                        {discussion.replyCount === 1 ? 'reply' : 'replies'}
                      </span>
                      <svg
                        aria-hidden="true"
                        className="w-4 h-4 text-neutral-400 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-emerald-600"
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
          </div>

          <div className="bg-surface rounded-card border border-border-subtle shadow-card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-semibold text-ink-strong uppercase tracking-wide">Announcements</h2>
              <Link
                to={`/announcements?subjectId=${subject.id}`}
                className="group inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-control"
              >
                View all announcements
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center rounded-card border border-dashed border-border-subtle bg-surface-soft px-4">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 ring-1 ring-inset ring-neutral-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </span>
                <p className="text-sm text-ink-muted">No announcements for this subject yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <Link
                    key={announcement.id}
                    to={`/announcements/${announcement.id}`}
                    className="group relative flex items-center gap-4 overflow-hidden p-4 bg-surface rounded-card border border-border-subtle shadow-card transition-all duration-200 ease-smooth hover:shadow-float hover:-translate-y-0.5 hover:border-emerald-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-0 h-full w-1 ${
                        announcement.priority === 'URGENT'
                          ? 'bg-red-500'
                          : announcement.priority === 'IMPORTANT'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500/50'
                      }`}
                    />
                    <span
                      aria-hidden="true"
                      className="w-10 h-10 shrink-0 rounded-control flex items-center justify-center bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/10 transition-colors duration-200 group-hover:bg-emerald-100 group-hover:ring-emerald-600/20"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1 min-w-0">
                        <h3 className="font-medium text-neutral-900 text-sm truncate min-w-0 transition-colors duration-150 group-hover:text-emerald-700">
                          {announcement.title}
                        </h3>
                        <span className="shrink-0">
                          <AnnouncementTypeBadge type={announcement.type} />
                        </span>
                        <span className="shrink-0">
                          <AnnouncementPriorityBadge priority={announcement.priority} />
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted truncate">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 shrink-0 text-neutral-400 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
