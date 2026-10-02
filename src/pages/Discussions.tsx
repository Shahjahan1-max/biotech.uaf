import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SectionHeader } from '../components/SectionHeader'
import { Button } from '../components/Button'
import { Spinner } from '../components/Spinner'
import { Badge } from '../components/Badge'
import { DiscussionForm } from '../components/DiscussionForm'
import { getSubjects } from '../services/subjects'
import {
  listDiscussions,
  createDiscussion,
  updateDiscussion,
} from '../services/discussions'
import type { DiscussionPost, DiscussionPostInput, PaginatedDiscussions } from '../types/discussion'
import type { Subject } from '../types/subject'

const inputClassName =
  'w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'

const EMPTY_PAGE: PaginatedDiscussions = {
  items: [],
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
}

export function Discussions() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [result, setResult] = useState<PaginatedDiscussions>(EMPTY_PAGE)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [searchParams] = useSearchParams()
  const subjectParam = searchParams.get('subjectId') ?? ''
  const [lastSubjectParam, setLastSubjectParam] = useState(subjectParam)
  const [selectedSubject, setSelectedSubject] = useState(subjectParam)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DiscussionPost | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  if (lastSubjectParam !== subjectParam) {
    setLastSubjectParam(subjectParam)
    setSelectedSubject(subjectParam)
    setPage(1)
  }

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError('')

    listDiscussions({
      subjectId: selectedSubject || undefined,
      search: search || undefined,
      page,
      limit: 20,
    })
      .then((data) => {
        if (active) setResult(data)
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load discussions.')
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedSubject, search, page, refreshKey])

  function refresh() {
    setRefreshKey((key) => key + 1)
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

  async function handleCreate(input: DiscussionPostInput) {
    await createDiscussion(input)
    setShowForm(false)
    setPage(1)
    refresh()
  }

  async function handleUpdate(input: DiscussionPostInput) {
    if (!editing) return
    await updateDiscussion(editing.id, input)
    setEditing(null)
    refresh()
  }

  const formOpen = showForm || editing !== null
  const hasFilters = Boolean(search || selectedSubject)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader
        as="h1"
        title="Academic Discussions"
        subtitle="Ask questions, share insights, and discuss course material with your class"
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null)
              setShowForm((open) => !open)
            }}
          >
            {showForm ? 'Cancel' : 'Create Discussion'}
          </Button>
        }
      />

      {formOpen && (
        <DiscussionForm
          subjects={subjects}
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => {
            setEditing(null)
            setShowForm(false)
          }}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <form onSubmit={handleSearch} className="block">
          <label htmlFor="discussion-search" className="text-sm font-medium text-neutral-600">Search</label>
          <div className="mt-1 flex gap-2">
            <input
              id="discussion-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search discussions..."
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
            onChange={(e) => {
              setPage(1)
              setSelectedSubject(e.target.value)
            }}
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
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner label="Loading discussions" />
          <p className="text-sm text-neutral-500">Loading discussions...</p>
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
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Error Loading Discussions</h3>
          <p className="text-sm text-neutral-500">{error || 'Unable to load discussions.'}</p>
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
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">
            {hasFilters ? 'No discussions found.' : 'No discussions yet.'}
          </h3>
          <p className="text-sm text-neutral-500">
            {hasFilters
              ? 'Try a different search or subject filter.'
              : 'Start the conversation by creating the first discussion.'}
          </p>
        </div>
      )}

      {!isLoading && !error && result.items.length > 0 && (
        <>
          <div className="space-y-4">
            {result.items.map((post) => (
              <Link
                key={post.id}
                to={`/discussions/${post.id}`}
                className="block p-5 bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-semibold text-neutral-900">{post.title}</h3>
                  {post.subject && (
                    <Badge variant="teal">
                      {post.subject.code} — {post.subject.name}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-neutral-600 line-clamp-2 mb-3">{post.content}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <span>{post.author?.name || 'Unknown'}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>
                    {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
                  </span>
                </div>
              </Link>
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
                Page {result.page} of {result.totalPages} · {result.total} discussion
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
