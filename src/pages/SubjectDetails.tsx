import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { ResourceTypeBadge } from '../components/ResourceTypeBadge'
import { AssignmentStatusBadge } from '../components/AssignmentStatusBadge'
import { Spinner } from '../components/Spinner'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-16">
          <Spinner label="Loading subject" />
        </div>
      </div>
    )
  }

  if (error || !subject) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Subject Not Found</h3>
          <p className="text-sm text-neutral-500 mb-4">{error || 'The requested subject could not be found.'}</p>
          <Link
            to="/subjects"
            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Back to Subjects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/subjects"
        className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-700 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Subjects
      </Link>

      <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">{subject.name}</h1>
            <Badge variant="emerald">{subject.code}</Badge>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-6">
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">Description</h2>
          <p className="text-neutral-700 leading-relaxed">
            {subject.description || 'No description available for this subject.'}
          </p>
        </div>

        <div className="border-t border-neutral-200 pt-6 mt-6">
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">Details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-neutral-400 uppercase tracking-wide">Subject Code</dt>
              <dd className="text-sm font-medium text-neutral-900 mt-1">{subject.code}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-400 uppercase tracking-wide">Added</dt>
              <dd className="text-sm font-medium text-neutral-900 mt-1">
                {new Date(subject.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-neutral-200 pt-6 mt-6">
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">Study Resources</h2>
          {resources.length === 0 ? (
            <p className="text-sm text-neutral-500">No study resources have been added yet.</p>
          ) : (
            <div className="space-y-3">
              {resources.map((resource) => {
                const resourceUrl = resource.url
                  ? resolveUploadUrl(resource.url)
                  : resource.filePath
                    ? resolveUploadUrl(resource.filePath)
                    : null

                return (
                  <div key={resource.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-neutral-900 text-sm truncate">{resource.title}</h3>
                        <ResourceTypeBadge type={resource.resourceType} />
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {resource.description || 'No description'}
                      </p>
                    </div>
                    {resourceUrl ? (
                      <a
                        href={resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 flex-shrink-0 inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        Open
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="ml-4 flex-shrink-0 text-sm text-neutral-400">No link</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div className="border-t border-neutral-200 pt-6 mt-6">
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">Assignments</h2>
          {assignments.length === 0 ? (
            <p className="text-sm text-neutral-500">No assignments have been created yet.</p>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  to={`/assignments/${assignment.id}`}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-neutral-900 text-sm truncate">
                        {assignment.title}
                      </h3>
                      <AssignmentStatusBadge status={assignment.status} />
                    </div>
                    <p className="text-xs text-neutral-500 truncate">
                      Due {new Date(assignment.dueDate).toLocaleDateString()}{' '}
                      {assignment.dueTime}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 ml-4 flex-shrink-0 text-neutral-400"
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
        <div className="border-t border-neutral-200 pt-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
              Class Schedule
            </h2>
            <Link
              to="/timetable"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Full timetable
            </Link>
          </div>
          {classSchedule.length === 0 ? (
            <p className="text-sm text-neutral-500">No classes are scheduled for this subject.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-neutral-400 border-b border-neutral-200">
                    <th className="py-2 pr-4 font-medium">Day</th>
                    <th className="py-2 pr-4 font-medium">Time</th>
                    <th className="py-2 pr-4 font-medium">Instructor</th>
                    <th className="py-2 font-medium">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {classSchedule.map((entry) => (
                    <tr key={entry.id} className="border-b border-neutral-100 last:border-0">
                      <td className="py-3 pr-4 font-medium text-neutral-900">
                        {DAY_LABELS[entry.dayOfWeek]}
                      </td>
                      <td className="py-3 pr-4 text-neutral-600">
                        {timeRange(entry.startTime, entry.endTime)}
                      </td>
                      <td className="py-3 pr-4 text-neutral-600">{entry.instructor}</td>
                      <td className="py-3 text-neutral-600">{entry.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-200 pt-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
              Discussions
            </h2>
            <Link
              to={`/discussions?subjectId=${subject.id}`}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all discussions
            </Link>
          </div>
          {discussions.length === 0 ? (
            <p className="text-sm text-neutral-500">No discussions have been started yet.</p>
          ) : (
            <div className="space-y-3">
              {discussions.map((discussion) => (
                <Link
                  key={discussion.id}
                  to={`/discussions/${discussion.id}`}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-900 text-sm truncate">
                      {discussion.title}
                    </h3>
                    <p className="text-xs text-neutral-500 truncate">
                      {discussion.author?.name || 'Unknown'} ·{' '}
                      {new Date(discussion.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="ml-4 flex-shrink-0 text-xs text-neutral-500">
                    {discussion.replyCount}{' '}
                    {discussion.replyCount === 1 ? 'reply' : 'replies'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-neutral-200 pt-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
              Announcements
            </h2>
            <Link
              to={`/announcements?subjectId=${subject.id}`}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all announcements
            </Link>
          </div>
          {announcements.length === 0 ? (
            <p className="text-sm text-neutral-500">No announcements for this subject yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <Link
                  key={announcement.id}
                  to={`/announcements/${announcement.id}`}
                  className="flex items-center justify-between gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-medium text-neutral-900 text-sm truncate">
                        {announcement.title}
                      </h3>
                      <AnnouncementTypeBadge type={announcement.type} />
                      <AnnouncementPriorityBadge priority={announcement.priority} />
                    </div>
                    <p className="text-xs text-neutral-500 truncate">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
