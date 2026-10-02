import { useState, type FormEvent } from 'react'
import { Button } from './Button'
import type { DiscussionPost, DiscussionPostInput } from '../types/discussion'
import type { Subject } from '../types/subject'

interface DiscussionFormProps {
  subjects: Subject[]
  initial?: DiscussionPost | null
  onSubmit: (input: DiscussionPostInput) => Promise<void>
  onCancel: () => void
}

const inputClassName =
  'w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'

export function DiscussionForm({ subjects, initial, onSubmit, onCancel }: DiscussionFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? '')
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
    if (!subjectId) {
      setError('Please select a subject')
      return
    }

    setIsSaving(true)
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        subjectId,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save discussion')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 p-6 mb-6 shadow-sm">
      <h3 className="font-semibold text-neutral-900 mb-4">
        {initial ? 'Edit Discussion' : 'New Discussion'}
      </h3>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`mt-1 ${inputClassName}`}
            placeholder="e.g. Question about DNA replication"
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

        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className={`mt-1 ${inputClassName}`}
            placeholder="Share your question or academic thoughts with the class"
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : initial ? 'Save Changes' : 'Create Discussion'}
        </Button>
      </div>
    </form>
  )
}
