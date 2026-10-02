import { useState, type FormEvent } from 'react'
import { Button } from './Button'
import type {
  Announcement,
  AnnouncementInput,
  AnnouncementPriority,
  AnnouncementType,
} from '../types/announcement'
import { ANNOUNCEMENT_PRIORITIES, ANNOUNCEMENT_TYPES } from '../types/announcement'
import type { Subject } from '../types/subject'

interface AnnouncementFormProps {
  subjects: Subject[]
  initial?: Announcement | null
  onSubmit: (input: AnnouncementInput) => Promise<void>
  onCancel: () => void
}

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

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function toDateInput(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toTimeInput(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function AnnouncementForm({
  subjects,
  initial,
  onSubmit,
  onCancel,
}: AnnouncementFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [type, setType] = useState<AnnouncementType>(initial?.type ?? 'GENERAL')
  const [priority, setPriority] = useState<AnnouncementPriority>(initial?.priority ?? 'NORMAL')
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? '')
  const [date, setDate] = useState(toDateInput(initial?.expiresAt ?? null))
  const [time, setTime] = useState(toTimeInput(initial?.expiresAt ?? null) || '23:59')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters')
      return
    }
    if (!content.trim()) {
      setError('Content is required')
      return
    }

    let expiresAt: string | null = null
    if (date) {
      const parsed = new Date(`${date}T${time || '23:59'}`)
      if (Number.isNaN(parsed.getTime())) {
        setError('Expiry must be a valid date and time')
        return
      }
      expiresAt = parsed.toISOString()
    }

    setIsSaving(true)
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        type,
        priority,
        subjectId: subjectId || null,
        expiresAt,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save announcement')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-neutral-200 p-6 mb-6 shadow-sm"
    >
      <h3 className="font-semibold text-neutral-900 mb-4">
        {initial ? 'Edit Announcement' : 'New Announcement'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-neutral-600">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`mt-1 ${inputClassName}`}
            placeholder="e.g. Midterm exam schedule"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AnnouncementType)}
            className={`mt-1 ${inputClassName}`}
          >
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
            value={priority}
            onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
            className={`mt-1 ${inputClassName}`}
          >
            {ANNOUNCEMENT_PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {PRIORITY_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-600">
            Subject <span className="text-neutral-400 font-normal">(optional)</span>
          </span>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className={`mt-1 ${inputClassName}`}
          >
            <option value="">General (all subjects)</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code} — {subject.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-neutral-600">
              Expiry date <span className="text-neutral-400 font-normal">(optional)</span>
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`mt-1 ${inputClassName}`}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-neutral-600">Expiry time</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`mt-1 ${inputClassName}`}
            />
          </label>
        </div>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-neutral-600">Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className={`mt-1 ${inputClassName}`}
            placeholder="Write the official class notice"
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : initial ? 'Save Changes' : 'Create Announcement'}
        </Button>
      </div>
    </form>
  )
}
