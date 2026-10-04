import { useEffect, useState } from 'react'
import { Spinner } from '../components/Spinner'
import { AssignmentCard } from '../components/AssignmentCard'
import { AssignmentForm } from '../components/AssignmentForm'
import { Button } from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import {
  listAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../services/assignments'
import { getSubjects } from '../services/subjects'
import type { Assignment, AssignmentInput, AssignmentStatus } from '../types/assignment'
import type { Subject } from '../types/subject'

const statusOptions: AssignmentStatus[] = ['UPCOMING', 'DUE_SOON', 'OVERDUE']

export function Assignments() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<AssignmentStatus | ''>('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Assignment | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError('')

    listAssignments(selectedSubject || undefined)
      .then((data) => {
        if (active) setAssignments(data)
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load assignments')
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedSubject, refreshKey])

  function refresh() {
    setRefreshKey((key) => key + 1)
  }

  async function handleCreate(input: AssignmentInput) {
    await createAssignment(input)
    setShowForm(false)
    refresh()
  }

  async function handleUpdate(input: AssignmentInput) {
    if (!editing) return
    await updateAssignment(editing.id, input)
    setEditing(null)
    refresh()
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Delete this assignment? This cannot be undone.')
    if (!confirmed) return

    try {
      await deleteAssignment(id)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assignment')
    }
  }

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSubject = !selectedSubject || assignment.subjectId === selectedSubject
    const matchesStatus = !selectedStatus || assignment.status === selectedStatus
    return matchesSubject && matchesStatus
  })

  const formOpen = showForm || editing !== null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative overflow-hidden mb-6 rounded-card border border-border-subtle bg-surface-tint shadow-panel animate-fade-up">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full opacity-70"
          style={{ backgroundImage: 'var(--gradient-halo)' }}
        />
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-3 right-5 hidden h-24 w-40 sm:block"
          fill="none"
          viewBox="0 0 160 96"
        >
          <rect
            x="8"
            y="16"
            width="88"
            height="72"
            rx="10"
            className="stroke-emerald-600/25"
            strokeWidth="2"
          />
          <path d="M8 36h88" className="stroke-emerald-600/25" strokeWidth="2" />
          <path
            d="M30 8v16M74 8v16"
            className="stroke-teal-500/40"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M34 58l10 10 22-22"
            className="stroke-cyan-500/60"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="128" cy="34" r="6" className="fill-indigo-400/50" />
          <circle cx="148" cy="62" r="4" className="fill-cyan-400/60" />
          <circle cx="122" cy="74" r="3" className="fill-emerald-400/60" />
          <path
            d="M128 34l20 28M128 34l-6 40M148 62l-26 12"
            className="stroke-indigo-400/40"
            strokeWidth="1.5"
          />
        </svg>

        <div className="relative flex flex-col gap-4 p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-600/20 bg-surface/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-secondary shadow-sm">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-luminous" />
              Academic Deadline Center
            </span>
            <h1
              className="mt-2.5 text-xl sm:text-2xl font-semibold tracking-tight text-transparent bg-clip-text"
              style={{ backgroundImage: 'var(--gradient-brand)' }}
            >
              Assignments
            </h1>
            <p className="text-sm text-ink-muted mt-1 leading-relaxed max-w-2xl">
              Track your assignment deadlines and submit work
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-baseline gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5 shadow-sm">
                <span className="text-sm font-bold text-emerald-700">{assignments.length}</span>
                <span className="text-xs font-medium text-ink-muted">Total</span>
              </span>
              <span className="inline-flex items-baseline gap-1.5 rounded-full border border-cyan-600/20 bg-cyan-50/70 px-3 py-1.5 shadow-sm">
                <span className="text-sm font-bold text-cyan-700">
                  {filteredAssignments.length}
                </span>
                <span className="text-xs font-medium text-ink-muted">Showing</span>
              </span>
            </div>
            {isAdmin && (
              <Button
                variant="primary"
                onClick={() => {
                  setEditing(null)
                  setShowForm((open) => !open)
                }}
              >
                {showForm ? 'Cancel' : 'New Assignment'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {isAdmin && formOpen && (
        <AssignmentForm
          subjects={subjects}
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => {
            setEditing(null)
            setShowForm(false)
          }}
        />
      )}

      <div className="mb-6 rounded-card border border-border-subtle bg-surface p-4 shadow-card animate-fade-up" style={{ animationDelay: '80ms' }}>
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/15">
            <svg
              aria-hidden="true"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </span>
          <span className="text-sm font-semibold text-ink-strong">Filters</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ink-muted">Subject</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-border-subtle rounded-control text-sm bg-surface text-ink-strong transition-colors duration-150 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
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
            <span className="text-sm font-medium text-ink-muted">Status</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as AssignmentStatus | '')}
              className="mt-1 w-full px-3 py-2 border border-border-subtle rounded-control text-sm bg-surface text-ink-strong transition-colors duration-150 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 rounded-card border border-border-subtle bg-surface-tint/70 shadow-card animate-reveal">
          <Spinner label="Loading" />
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="text-center py-16 rounded-card border border-border-subtle bg-surface shadow-card animate-reveal"
        >
          <div
            aria-hidden="true"
            className="w-16 h-16 bg-danger-soft rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-inset ring-danger/10"
          >
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-danger"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-ink-strong mb-1">Error Loading Assignments</h3>
          <p className="text-sm text-ink-muted">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssignments.map((assignment, index) => (
            <div
              key={assignment.id}
              className="flex flex-col animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <AssignmentCard assignment={assignment} />
              {isAdmin && (
                <div className="mt-2 flex justify-end gap-2 rounded-card border border-border-subtle bg-surface-soft/60 px-2.5 py-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border-subtle! hover:border-emerald-300! hover:bg-surface-tint hover:text-emerald-700"
                    onClick={() => {
                      setShowForm(false)
                      setEditing(assignment)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(assignment.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}

          {filteredAssignments.length === 0 && (
            <div className="col-span-full text-center py-16 rounded-card border border-border-subtle bg-surface shadow-card animate-reveal">
              <div
                aria-hidden="true"
                className="w-16 h-16 bg-surface-tint rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-inset ring-emerald-600/10"
              >
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-ink-strong mb-1">No Assignments Found</h3>
              <p className="text-sm text-ink-muted">
                {isAdmin
                  ? 'Create your first assignment to get started.'
                  : 'No assignments match your filters. Ask your instructor to create assignments.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
