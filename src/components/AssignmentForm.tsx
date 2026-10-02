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
  'w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'

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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 p-6 mb-6 shadow-sm">
      <h3 className="font-semibold text-neutral-900 mb-4">
        {initial ? 'Edit Assignment' : 'New Assignment'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-neutral-600">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`mt-1 ${inputClassName}`}
            placeholder="e.g. Lab Report 3"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-neutral-600">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`mt-1 ${inputClassName}`}
            placeholder="Optional instructions for this assignment"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Subject</span>
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
            <span className="text-sm font-medium text-neutral-600">Due date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`mt-1 ${inputClassName}`}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-neutral-600">Due time</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`mt-1 ${inputClassName}`}
            />
          </label>
        </div>

        <div className="sm:col-span-2">
          <span className="text-sm font-medium text-neutral-600">
            Attachment <span className="text-neutral-400 font-normal">(optional)</span>
          </span>

          {attachment.fileName && !file && (
            <div className="mt-1 flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
              <p className="text-sm text-neutral-600 truncate">{attachment.fileName}</p>
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

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : initial ? 'Save Changes' : 'Create Assignment'}
        </Button>
      </div>
    </form>
  )
}
