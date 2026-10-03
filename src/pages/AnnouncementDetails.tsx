import { useRequestStatus } from '../hooks/useRequestStatus'
import { useEffect, useState } from 'react'
import { Spinner } from '../components/Spinner'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { AnnouncementForm } from '../components/AnnouncementForm'
import { AnnouncementPriorityBadge } from '../components/AnnouncementPriorityBadge'
import { AnnouncementTypeBadge } from '../components/AnnouncementTypeBadge'
import { useAuth } from '../hooks/useAuth'
import { getSubjects } from '../services/subjects'
import {
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../services/announcements'
import type { Announcement, AnnouncementInput } from '../types/announcement'
import type { Subject } from '../types/subject'

export function AnnouncementDetails() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'

  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isEditing, setIsEditing] = useState(false)

  const { isLoading, error, setError, setIsLoading } = useRequestStatus(JSON.stringify([id]))

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    if (!id) return


    getAnnouncement(id)
      .then((data) => {
        if (active) {
          setAnnouncement(data)
          setError('')
        }
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Announcement not found')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, setError, setIsLoading])

  async function handleUpdate(input: AnnouncementInput) {
    if (!announcement) return
    const updated = await updateAnnouncement(announcement.id, input)
    setAnnouncement(updated)
    setIsEditing(false)
  }

  async function handleDelete() {
    if (!announcement) return
    const confirmed = window.confirm(
      'Delete this announcement? This cannot be undone.'
    )
    if (!confirmed) return

    try {
      await deleteAnnouncement(announcement.id)
      navigate('/announcements')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete announcement')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner label="Loading" />
          <p className="text-sm text-neutral-500">Loading announcement...</p>
        </div>
      </div>
    )
  }

  if (error || !announcement) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Announcement Not Found</h3>
          <p className="text-sm text-neutral-500 mb-4">
            {error || 'The requested announcement could not be found.'}
          </p>
          <Link
            to="/announcements"
            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Back to Announcements
          </Link>
        </div>
      </div>
    )
  }

  const borderColor =
    announcement.priority === 'URGENT'
      ? 'border-red-300'
      : announcement.priority === 'IMPORTANT'
        ? 'border-amber-300'
        : 'border-neutral-200'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/announcements"
        className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-700 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Announcements
      </Link>

      {isEditing ? (
        <AnnouncementForm
          subjects={subjects}
          initial={announcement}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className={`bg-white rounded-xl border-2 ${borderColor} p-6 shadow-sm`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <AnnouncementTypeBadge type={announcement.type} />
                <AnnouncementPriorityBadge priority={announcement.priority} />
                {announcement.isExpired && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                    Expired
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-3 break-words">
                {announcement.title}
              </h1>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-500 mb-4">
            <span>Published {new Date(announcement.createdAt).toLocaleString()}</span>
            {announcement.author && <span>By {announcement.author.name}</span>}
            {announcement.subject ? (
              <Link
                to={`/subjects/${announcement.subject.id}`}
                className="font-medium text-emerald-600 hover:text-emerald-700"
              >
                {announcement.subject.code} — {announcement.subject.name}
              </Link>
            ) : (
              <span>All subjects</span>
            )}
            {announcement.expiresAt && (
              <span>
                {announcement.isExpired ? 'Expired ' : 'Expires '}
                {new Date(announcement.expiresAt).toLocaleString()}
              </span>
            )}
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {announcement.content}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
