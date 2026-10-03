import { useEffect, useState, type FormEvent } from 'react'
import { Spinner } from '../components/Spinner'
import { SectionHeader } from '../components/SectionHeader'
import { SubjectGrid } from '../components/SubjectGrid'
import { getSubjects, saveSubject, deleteSubject } from '../services/subjects'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/Button'
import type { Subject } from '../types/subject'

export function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Subject | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    getSubjects()
      .then(setSubjects)
      .catch(() => setError('Failed to load subjects'))
      .finally(() => setIsLoading(false))
  }, [])

  function openForm(subject: Subject | null) {
    setEditing(subject)
    setName(subject?.name ?? '')
    setCode(subject?.code ?? '')
    setDescription(subject?.description ?? '')
    setFormError('')
    setShowForm(true)
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    setIsSaving(true)
    setFormError('')
    try {
      const subject = await saveSubject({ name: name.trim(), code: code.trim(), description: description.trim() || null }, editing?.id)
      setSubjects((current) => editing ? current.map((entry) => entry.id === subject.id ? subject : entry) : [subject, ...current])
      setShowForm(false)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save subject.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(subject: Subject) {
    if (!window.confirm(`Delete ${subject.name} and its resources, assignments, timetable, and discussions? This cannot be undone.`)) return
    try {
      await deleteSubject(subject.id)
      setSubjects((current) => current.filter((entry) => entry.id !== subject.id))
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to delete subject.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader
        as="h1"
        title="Subjects"
        subtitle="Explore your biotechnology courses"
        action={isAdmin && <Button variant="primary" onClick={() => openForm(null)}>Add Subject</Button>}
      />

      {isAdmin && showForm && (
        <form onSubmit={handleSave} className="mb-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-neutral-900">{editing ? 'Edit Subject' : 'Add Subject'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-neutral-700">
              Name
              <input required maxLength={200} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-neutral-700">
              Course code
              <input required maxLength={20} value={code} onChange={(event) => setCode(event.target.value)} className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-neutral-700 sm:col-span-2">
              Description
              <textarea maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2" />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Subject'}</Button>
          </div>
        </form>
      )}
      {formError && <p role="alert" className="mb-4 text-sm text-red-600">{formError}</p>}

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner label="Loading" />
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Error Loading Subjects</h3>
          <p className="text-sm text-neutral-500">{error}</p>
        </div>
      )}

      {!isLoading && !error && <SubjectGrid subjects={subjects} onEdit={isAdmin ? openForm : undefined} onDelete={isAdmin ? handleDelete : undefined} />}
    </div>
  )
}
