import { useState, type FormEvent } from 'react'
import { Button } from './Button'
import type { Subject, SubjectInput } from '../types/subject'

interface SubjectFormProps {
  initial?: Subject | null
  onSubmit: (input: SubjectInput) => Promise<void>
  onCancel: () => void
}

const inputClassName =
  'w-full px-3 py-2.5 border border-border-subtle rounded-control text-sm bg-surface text-ink-strong placeholder:text-ink-muted transition-colors duration-150 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500'

const MAX_NAME_LENGTH = 200
const MAX_CODE_LENGTH = 20
const MAX_DESCRIPTION_LENGTH = 2000

export function SubjectForm({ initial, onSubmit, onCancel }: SubjectFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (name.trim().length > MAX_NAME_LENGTH) {
      setError(`Name must be at most ${MAX_NAME_LENGTH} characters`)
      return
    }
    if (!code.trim()) {
      setError('Code is required')
      return
    }
    if (code.trim().length > MAX_CODE_LENGTH) {
      setError(`Code must be at most ${MAX_CODE_LENGTH} characters`)
      return
    }
    if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
      setError(`Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`)
      return
    }

    setIsSaving(true)
    try {
      await onSubmit({
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subject')
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </span>
        <h3 className="text-base font-semibold text-ink-strong">
          {initial ? 'Edit Subject' : 'New Subject'}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-ink-muted">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            className={`mt-1 ${inputClassName}`}
            placeholder="e.g. Molecular Biology"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink-muted">Code</span>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={MAX_CODE_LENGTH}
            className={`mt-1 ${inputClassName}`}
            placeholder="e.g. BIOT-301"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-ink-muted">
            Description <span className="text-ink-muted font-normal">(optional)</span>
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={MAX_DESCRIPTION_LENGTH}
            rows={4}
            className={`mt-1 ${inputClassName}`}
            placeholder="What this subject covers"
          />
        </label>
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
          {isSaving ? 'Saving...' : initial ? 'Save Changes' : 'Create Subject'}
        </Button>
      </div>
    </form>
  )
}
