import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SectionHeader } from '../components/SectionHeader'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { AnnouncementForm } from '../components/AnnouncementForm'
import { AnnouncementPriorityBadge } from '../components/AnnouncementPriorityBadge'
import { AnnouncementTypeBadge } from '../components/AnnouncementTypeBadge'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../hooks/useAuth'
import { getSubjects } from '../services/subjects'
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../services/announcements'
import type {
  Announcement,
  AnnouncementInput,
  AnnouncementPriority,
  AnnouncementType,
  PaginatedAnnouncements,
} from '../types/announcement'
import { ANNOUNCEMENT_PRIORITIES, ANNOUNCEMENT_TYPES } from '../types/announcement'
import type { Subject } from '../types/subject'

const inputClassName =
  'w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'

const TYPE_LABELS: Record<AnnouncementType, string> = {
  GENERAL: 'General',
  ASSIGNMENT: 'Assignment',
  QUIZ: 'Quiz',
  EXAM: 'Exam',
  LECTURE: 'Lecture',
  SCHEDULE: 'Schedule',
  RESOURCE: 'Resource',
  OTHER: 'Other',
}

const PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  NORMAL: 'Normal',
  IMPORTANT: 'Important',
  URGENT: 'Urgent',
}

const EMPTY_PAGE: PaginatedAnnouncements = {
  items: [],
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
}

export function Announcements() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [searchParams] = useSearchParams()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [result, setResult] = useState<PaginatedAnnouncements>(EMPTY_PAGE)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const subjectParam = searchParams.get('subjectId') ?? ''
  const scopeParam = searchParams.get('scope') ?? ''
  const validScope = scopeParam === 'general' || scopeParam === 'subject' ? scopeParam : ''
  const [lastSubjectParam, setLastSubjectParam] = useState(subjectParam)
  const [selectedSubject, setSelectedSubject] = useState(subjectParam)
  const [lastScopeParam, setLastScopeParam] = useState(validScope)
  const [selectedScope, setSelectedScope] = useState(validScope)
  const [selectedType, setSelectedType] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [includeExpired, setIncludeExpired] = useState(false)
  const [page, setPage] = useState(1)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [actionError, setActionError] = useState('')

  if (lastSubjectParam !== subjectParam) {
    setLastSubjectParam(subjectParam)
    setSelectedSubject(subjectParam)
    setPage(1)
  }

  if (lastScopeParam !== validScope) {
    setLastScopeParam(validScope)
    setSelectedScope(validScope)
    setPage(1)
  }

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError('')

    listAnnouncements({
      subjectId: selectedSubject || undefined,
      scope: selectedScope || undefined,
      type: selectedType || undefined,
      priority: selectedPriority || undefined,
      search: search || undefined,
      includeExpired: isAdmin ? includeExpired : undefined,
      page,
      limit: 20,
    })
      .then((data) => {
        if (active) setResult(data)
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load announcements.')
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedSubject, selectedScope, selectedType, selectedPriority, search, includeExpired, isAdmin, page, refreshKey])

  function refresh() {
    setRefreshKey((key) => key + 1)
  }

  function resetPageAnd(setter: (value: string) => void) {
    return (value: string) => {
      setPage(1)
      setter(value)
    }
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  function clearSearch() {
    setSearchInput('')
    setPage(1)
    setSearch('')
  }

  async function handleCreate(input: AnnouncementInput) {
    await createAnnouncement(input)
    setShowForm(false)
    setPage(1)
    refresh()
  }

  async function handleUpdate(input: AnnouncementInput) {
    if (!editing) return
    await updateAnnouncement(editing.id, input)
    setEditing(null)
    refresh()
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Delete this announcement? This cannot be undone.'
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

  const formOpen = isAdmin && (showForm || editing !== null)
  const hasFilters = Boolean(search || selectedSubject || selectedScope || selectedType || selectedPriority)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader
        as="h1"
        title="Announcements"
        subtitle="Official class notices, schedule changes, and academic updates"
        action={
          isAdmin ? (
            <Button
              variant="primary"
              onClick={() => {
                setEditing(null)
                setShowForm((open) => !open)
              }}
            >
              {showForm ? 'Cancel' : 'Create Announcement'}
            </Button>
          ) : undefined
        }
      />

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <form onSubmit={handleSearch} className="block lg:col-span-1">
          <label htmlFor="announcement-search" className="text-sm font-medium text-neutral-600">Search</label>
          <div className="mt-1 flex gap-2">
            <input
              id="announcement-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search announcements..."
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
                onClick={clearSearch}
              >
                Clear
              </Button>
            )}
          </div>
        </form>

        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Subject</span>
          <select
            value={selectedSubject}
            onChange={(e) => resetPageAnd(setSelectedSubject)(e.target.value)}
            className={`mt-1 ${inputClassName}`}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code} — {subject.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Scope</span>
          <select
            value={selectedScope}
            onChange={(e) => resetPageAnd(setSelectedScope)(e.target.value)}
            className={`mt-1 ${inputClassName}`}
          >
            <option value="">All Announcements</option>
            <option value="general">General (no subject)</option>
            <option value="subject">Subject-specific</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Type</span>
          <select
            value={selectedType}
            onChange={(e) => resetPageAnd(setSelectedType)(e.target.value)}
            className={`mt-1 ${inputClassName}`}
          >
            <option value="">All Types</option>
            {ANNOUNCEMENT_TYPES.map((value) => (
              <option key={value} value={value}>
                {TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Priority</span>
          <select
            value={selectedPriority}
            onChange={(e) => resetPageAnd(setSelectedPriority)(e.target.value)}
            className={`mt-1 ${inputClassName}`}
          >
            <option value="">All Priorities</option>
            {ANNOUNCEMENT_PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {PRIORITY_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isAdmin && (
        <label className="flex items-center gap-2 mb-6 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={includeExpired}
            onChange={(e) => {
              setPage(1)
              setIncludeExpired(e.target.checked)
            }}
            className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
          />
          Include expired announcements
        </label>
      )}

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError('')}
            className="font-medium text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner label="Loading announcements" />
          <p className="text-sm text-neutral-500">Loading announcements...</p>
        </div>
      )}

      {error && !isLoading && (
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
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Error Loading Announcements</h3>
          <p className="text-sm text-neutral-500">{error || 'Unable to load announcements.'}</p>
        </div>
      )}

      {!isLoading && !error && result.items.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M5 10.5V4.5a1.5 1.5 0 011.5-1.5h4.5M18 10.5v8.647a1.76 1.76 0 01-3.417.592l-2.147-6.15M13.5 10.5h4.5A1.5 1.5 0 0019.5 9V4.5A1.5 1.5 0 0018 3H6a1.5 1.5 0 00-1.5 1.5v6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">
            {hasFilters ? 'No announcements found.' : 'No announcements yet.'}
          </h3>
          <p className="text-sm text-neutral-500">
            {hasFilters
              ? 'Try a different search or filter combination.'
              : 'Official class announcements will appear here.'}
          </p>
        </div>
      )}

      {!isLoading && !error && result.items.length > 0 && (
        <>
          <div className="space-y-4">
            {result.items.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-5 bg-white rounded-xl border shadow-sm transition-colors ${
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
                  <AnnouncementTypeBadge type={announcement.type} />
                  <AnnouncementPriorityBadge priority={announcement.priority} />
                  {!announcement.subject && <Badge variant="emerald">General</Badge>}
                  {announcement.subject && (
                    <Badge variant="teal">
                      {announcement.subject.code} — {announcement.subject.name}
                    </Badge>
                  )}
                  {announcement.isExpired && (
                    <Badge variant="neutral">Expired</Badge>
                  )}
                </div>

                <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                  {announcement.content}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                    <span>
                      Published {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                    {announcement.expiresAt && (
                      <span>
                        {announcement.isExpired
                          ? 'Expired '
                          : 'Expires '}
                        {new Date(announcement.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {isAdmin && (
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
                  )}
                </div>
              </div>
            ))}
          </div>

          {(result.totalPages > 1 || result.page > 1) && (
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={result.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-neutral-500">
                Page {result.page} of {result.totalPages} · {result.total} announcement
                {result.total === 1 ? '' : 's'}
              </span>
              <Button
                variant="outline"
                disabled={result.page >= result.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
