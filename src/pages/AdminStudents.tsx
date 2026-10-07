import { useEffect, useState, type FormEvent } from 'react'
import { Spinner } from '../components/Spinner'
import { Link } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { SectionHeader } from '../components/SectionHeader'
import { listAdminStudents, updateAdminStudentUsername } from '../services/admin'
import type { AdminStudent, PaginatedAdminStudents } from '../types/admin'

const inputClassName =
  'w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'

const EMPTY_PAGE: PaginatedAdminStudents = {
  items: [],
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
}

export function AdminStudents() {
  const [result, setResult] = useState<PaginatedAdminStudents>(EMPTY_PAGE)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [editId, setEditId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError('')

    listAdminStudents({ search: search || undefined, page, limit: 20 })
      .then((data) => {
        if (active) setResult(data)
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load students.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [search, page, refreshKey])

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
    refresh()
  }

  function startEdit(student: AdminStudent) {
    if (isSaving) return
    setEditId(student.id)
    setEditValue(student.username)
    setEditError('')
  }

  function cancelEdit() {
    if (isSaving) return
    setEditId(null)
    setEditError('')
  }

  async function saveEdit(student: AdminStudent) {
    if (isSaving) return
    setIsSaving(true)
    setEditError('')

    try {
      await updateAdminStudentUsername(student.id, editValue)
      setEditId(null)
      refresh()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update Student ID.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader
        as="h1"
        title="Students"
        subtitle="View registered accounts for the Biotechnology Section A portal"
        action={
          <Link
            to="/admin"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Back to Dashboard
          </Link>
        }
      />

      <form onSubmit={handleSearch} className="mb-6 max-w-xl">
          <label htmlFor="student-search" className="text-sm font-medium text-neutral-600">Search</label>
          <div className="mt-1 flex gap-2">
            <input
              id="student-search"
              type="text"
              value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
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

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner label="Loading" />
          <p className="text-sm text-neutral-500">Loading students...</p>
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
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Error Loading Students</h3>
          <p className="text-sm text-neutral-500">{error || 'Unable to load students.'}</p>
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">
            {search ? 'No students found.' : 'No students registered yet.'}
          </h3>
          <p className="text-sm text-neutral-500">
            {search
              ? 'Try a different name or email search.'
              : 'No accounts have been registered yet.'}
          </p>
        </div>
      )}

      {!isLoading && !error && result.items.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-neutral-400 border-b border-neutral-200 bg-neutral-50">
                    <th className="py-3 px-5 font-medium">Name</th>
                    <th className="py-3 px-5 font-medium">Username / Student ID</th>
                    <th className="py-3 px-5 font-medium">Email</th>
                    <th className="py-3 px-5 font-medium">Role</th>
                    <th className="py-3 px-5 font-medium">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((student: AdminStudent) => (
                    <tr
                      key={student.id}
                      className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="py-3 px-5 font-medium text-neutral-900">{student.name}</td>
                      <td className="py-3 px-5 text-neutral-900">
                        <UsernameEditor
                          student={student}
                          editing={editId === student.id}
                          value={editValue}
                          error={editId === student.id ? editError : ''}
                          isSaving={isSaving}
                          onStart={startEdit}
                          onChange={setEditValue}
                          onSave={saveEdit}
                          onCancel={cancelEdit}
                        />
                      </td>
                      <td className="py-3 px-5 text-neutral-600">{student.email}</td>
                      <td className="py-3 px-5">
                        <Badge variant={student.role === 'ADMIN' ? 'amber' : 'emerald'}>
                          {student.role === 'ADMIN' ? 'Admin' : 'Student'}
                        </Badge>
                      </td>
                      <td className="py-3 px-5 text-neutral-600">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-neutral-100">
              {result.items.map((student: AdminStudent) => (
                <div key={student.id} className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-neutral-900 text-sm truncate">
                      {student.name}
                    </p>
                    <Badge variant={student.role === 'ADMIN' ? 'amber' : 'emerald'}>
                      {student.role === 'ADMIN' ? 'Admin' : 'Student'}
                    </Badge>
                  </div>
                  <div className="mt-1.5">
                    <UsernameEditor
                      student={student}
                      editing={editId === student.id}
                      value={editValue}
                      error={editId === student.id ? editError : ''}
                      isSaving={isSaving}
                      onStart={startEdit}
                      onChange={setEditValue}
                      onSave={saveEdit}
                      onCancel={cancelEdit}
                    />
                  </div>
                  <p className="text-sm text-neutral-600 break-all">{student.email}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Registered {new Date(student.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              disabled={result.page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-neutral-500">
              Page {result.page} of {result.totalPages} · {result.total} account
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
        </>
      )}
    </div>
  )
}

interface UsernameEditorProps {
  student: AdminStudent
  editing: boolean
  value: string
  error: string
  isSaving: boolean
  onStart: (student: AdminStudent) => void
  onChange: (value: string) => void
  onSave: (student: AdminStudent) => void
  onCancel: () => void
}

function UsernameEditor({
  student,
  editing,
  value,
  error,
  isSaving,
  onStart,
  onChange,
  onSave,
  onCancel,
}: UsernameEditorProps) {
  if (!editing) {
    return (
      <span className="inline-flex items-center gap-1 flex-wrap">
        <span className="break-all">{student.username}</span>
        {student.role === 'STUDENT' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-2"
            onClick={() => onStart(student)}
            disabled={isSaving}
          >
            Edit
          </Button>
        )}
      </span>
    )
  }

  return (
    <div className="min-w-[12rem] max-w-xs">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onSave(student)
          } else if (e.key === 'Escape') {
            onCancel()
          }
        }}
        autoFocus
        maxLength={50}
        aria-label="Student ID"
        className={inputClassName}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      <div className="flex gap-1 mt-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSave(student)}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
