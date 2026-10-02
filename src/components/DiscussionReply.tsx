import { useState, type FormEvent } from 'react'
import { Button } from './Button'
import type { DiscussionReply as DiscussionReplyType } from '../types/discussion'

interface DiscussionReplyProps {
  reply: DiscussionReplyType
  canModify: boolean
  onUpdate: (content: string) => Promise<void>
  onDelete: () => Promise<void>
}

const inputClassName =
  'w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'

export function DiscussionReply({ reply, canModify, onUpdate, onDelete }: DiscussionReplyProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(reply.content)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!draft.trim()) {
      setError('Reply content is required')
      return
    }

    setIsSaving(true)
    try {
      await onUpdate(draft.trim())
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reply')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm('Delete this reply? This cannot be undone.')
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await onDelete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reply')
      setIsDeleting(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-neutral-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-700 font-medium text-xs">
              {(reply.author?.name || '?').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {reply.author?.name || 'Unknown'}
            </p>
            <p className="text-xs text-neutral-500">
              {new Date(reply.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {canModify && !isEditing && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setDraft(reply.content)
                setError('')
                setIsEditing(true)
              }}
              disabled={isDeleting}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="mt-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            aria-label="Edit reply"
            className={inputClassName}
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                setError('')
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Reply'}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-3 text-sm text-neutral-700 whitespace-pre-wrap">{reply.content}</p>
      )}

      {!isEditing && error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
