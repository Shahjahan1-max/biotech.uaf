import { useState, type FormEvent } from 'react'
import { Button } from './Button'
import { FileUpload } from './FileUpload'
import { uploadFile } from '../services/uploads'
import type { Assignment, AssignmentInput } from '../types/assignment'
import type { Subject } from '../types/subject'

interface AssignmentFormProps {
  subjects: Subject[]
  initial?: Assignment | null
  onSubmit: (input: AssignmentInput) => Promise<void>
  onCancel: () => void
}

const inputClassName =
  'w-full px-3 py-2.5 border border-border-subtle rounded-control text-sm bg-surface text-ink-strong placeholder:text-ink-muted transition-colors duration-150 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function toDateInput(iso: string): string {
  const date = new Date(iso)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toTimeInput(iso: string): string {
  const date = new Date(iso)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function AssignmentForm({ subjects, initial, onSubmit, onCancel }: AssignmentFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? '')
  const [date, setDate] = useState(initial ? toDateInput(initial.dueDate) : '')
  const [time, setTime] = useState(initial ? toTimeInput(initial.dueDate) : '23:59')
  const [file, setFile] = useState<File | null>(null)
  const [attachment, setAttachment] = useState({
    fileName: initial?.fileName ?? null,
    filePath: initial?.filePath ?? null,
  })
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!subjectId) {
      setError('Please select a subject')
      return
    }
    if (!date || !time) {
      setError('Due date and time are required')
      return
    }

    setIsSaving(true)
    try {
      let fileName = attachment.fileName
      let filePath = attachment.filePath

      if (file) {
        const uploaded = await uploadFile(file)
        fileName = uploaded.originalFileName
        filePath = uploaded.storedFileName
      }

      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: new Date(`${date}T${time}`).toISOString(),
        subjectId,
        fileName,
        filePath,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save assignment')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface rounded-card border border-border-subtle p-6 mb-6 shadow-panel animate-reveal"
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-white shadow-sm ring-1 ring-inset ring-white/40"
          style={{ backgroundImage: 'var(--gradient-brand)' }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </span>
        <h3 className="text-base font-semibold text-ink-strong">
          {initial ? 'Edit Assignment' : 'New Assignment'}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-ink-muted">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`mt-1 ${inputClassName}`}
            placeholder="e.g. Lab Report 3"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-ink-muted">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`mt-1 ${inputClassName}`}
            placeholder="Optional instructions for this assignment"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink-muted">Subject</span>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className={`mt-1 ${inputClassName}`}
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code} — {subject.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-ink-muted">Due date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`mt-1 ${inputClassName}`}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-muted">Due time</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`mt-1 ${inputClassName}`}
            />
          </label>
        </div>

        <div className="sm:col-span-2">
          <span className="text-sm font-medium text-ink-muted">
            Attachment <span className="text-ink-muted font-normal">(optional)</span>
          </span>

          {attachment.fileName && !file && (
            <div className="mt-1 flex items-center justify-between p-3 bg-surface-soft border border-border-subtle rounded-control">
              <p className="text-sm text-ink-muted truncate">{attachment.fileName}</p>
              <button
                type="button"
                onClick={() => setAttachment({ fileName: null, filePath: null })}
                className="ml-3 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          )}

          <div className="mt-2">
            <FileUpload
              onFileSelect={setFile}
              onFileRemove={() => setFile(null)}
              isUploading={isSaving}
            />
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <div className="mt-5 flex justify-end gap-3 border-t border-border-subtle pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSaving}
          style={{ backgroundImage: 'var(--gradient-brand)' }}
        >
          {isSaving ? 'Saving...' : initial ? 'Save Changes' : 'Create Assignment'}
        </Button>
      </div>
    </form>
  )
}
