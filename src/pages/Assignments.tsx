import { useEffect, useState } from 'react'
import { Spinner } from '../components/Spinner'
import { SectionHeader } from '../components/SectionHeader'
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
      <SectionHeader
        as="h1"
        title="Assignments"
        subtitle="Track your assignment deadlines and submit work"
        action={
          isAdmin ? (
            <Button
              variant="primary"
              onClick={() => {
                setEditing(null)
                setShowForm((open) => !open)
              }}
            >
              {showForm ? 'Cancel' : 'New Assignment'}
            </Button>
          ) : undefined
        }
      />

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Subject</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
          <span className="text-sm font-medium text-neutral-600">Status</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as AssignmentStatus | '')}
            className="mt-1 w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner label="Loading" />
        </div>
      )}

      {error && (
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
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Error Loading Assignments</h3>
          <p className="text-sm text-neutral-500">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="flex flex-col">
              <AssignmentCard assignment={assignment} />
              {isAdmin && (
                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
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
                    onClick={() => handleDelete(assignment.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}

          {filteredAssignments.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-1">No Assignments Found</h3>
              <p className="text-sm text-neutral-500">
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
