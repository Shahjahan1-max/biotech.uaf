import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { Badge } from './Badge'
import { Spinner } from './Spinner'
import { AnnouncementForm } from './AnnouncementForm'
import { AnnouncementPriorityBadge } from './AnnouncementPriorityBadge'
import { AnnouncementTypeBadge } from './AnnouncementTypeBadge'
import { getSubjects } from '../services/subjects'
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../services/announcements'
import type { Announcement, AnnouncementInput } from '../types/announcement'
import type { Subject } from '../types/subject'

const inputClassName =
  'w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'

const MAX_ITEMS = 10

export function GeneralAnnouncementsPanel() {
  const [items, setItems] = useState<Announcement[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true

    listAnnouncements({
      scope: 'general',
      search: search || undefined,
      includeExpired: true,
      limit: MAX_ITEMS,
    })
      .then((data) => {
        if (active) {
          setError('')
          setItems(data.items)
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load general announcements.')
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [search, refreshKey])

  function refresh() {
    setRefreshKey((key) => key + 1)
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    setSearch(searchInput.trim())
  }

  async function handleCreate(input: AnnouncementInput) {
    await createAnnouncement({ ...input, subjectId: null })
    setShowForm(false)
    refresh()
  }

  async function handleUpdate(input: AnnouncementInput) {
    if (!editing) return
    await updateAnnouncement(editing.id, { ...input, subjectId: null })
    setEditing(null)
    refresh()
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Delete this general announcement? This cannot be undone.'
    )
    if (!confirmed) return

    try {
      await deleteAnnouncement(id)
      setActionError('')
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete announcement')
    }
  }

  const formOpen = showForm || editing !== null

  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">General Announcements</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Publish class-wide notices, events, trips, and holidays — no subject required
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/announcements?scope=general"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            View all
          </Link>
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null)
              setShowForm((open) => !open)
            }}
          >
            {showForm ? 'Cancel' : 'New General Announcement'}
          </Button>
        </div>
      </div>

      {formOpen && (
        <AnnouncementForm
          subjects={subjects}
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => {
            setEditing(null)
            setShowForm(false)
          }}
        />
      )}

      <form onSubmit={handleSearch} className="flex gap-2 mb-4 max-w-md">
        <label htmlFor="general-announcement-search" className="sr-only">
          Search general announcements
        </label>
        <input
          id="general-announcement-search"
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search general announcements..."
          className={inputClassName}
        />
        <Button type="submit" variant="outline" className="flex-shrink-0">
          Search
        </Button>
        {search && (
          <Button
            type="button"
            variant="ghost"
            className="flex-shrink-0"
            onClick={() => {
              setSearchInput('')
              setSearch('')
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {actionError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {actionError}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Spinner label="Loading general announcements" />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p role="alert" className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center">
          <p className="text-sm font-medium text-neutral-900 mb-1">
            No general announcements yet.
          </p>
          <p className="text-sm text-neutral-500">
            Create one to notify every student about events, trips, or holidays.
          </p>
        </div>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-4 bg-white rounded-xl border shadow-sm transition-colors ${
                announcement.isExpired
                  ? 'border-neutral-200 opacity-75'
                  : announcement.priority === 'URGENT'
                    ? 'border-red-200'
                    : announcement.priority === 'IMPORTANT'
                      ? 'border-amber-200'
                      : 'border-neutral-200'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Link
                  to={`/announcements/${announcement.id}`}
                  className="font-semibold text-neutral-900 hover:text-emerald-700"
                >
                  {announcement.title}
                </Link>
                <Badge variant="emerald">General</Badge>
                <AnnouncementTypeBadge type={announcement.type} />
                <AnnouncementPriorityBadge priority={announcement.priority} />
                {announcement.isExpired && <Badge variant="neutral">Expired</Badge>}
              </div>

              <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                {announcement.content}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <span className="text-xs text-neutral-500">
                  Published {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditing(announcement)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
