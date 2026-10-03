import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Spinner } from '../components/Spinner'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { DiscussionForm } from '../components/DiscussionForm'
import { DiscussionReply } from '../components/DiscussionReply'
import { useAuth } from '../hooks/useAuth'
import { getSubjects } from '../services/subjects'
import {
  getDiscussion,
  updateDiscussion,
  deleteDiscussion,
  listReplies,
  createReply,
  updateReply,
  deleteReply,
} from '../services/discussions'
import type {
  DiscussionPost,
  DiscussionPostInput,
  DiscussionReply as DiscussionReplyType,
} from '../types/discussion'
import type { Subject } from '../types/subject'

const inputClassName =
  'w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'

export function DiscussionDetails() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [post, setPost] = useState<DiscussionPost | null>(null)
  const [replies, setReplies] = useState<DiscussionReplyType[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const [replyDraft, setReplyDraft] = useState('')
  const [replyError, setReplyError] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const canModify = Boolean(
    user && post && (user.id === post.authorId || user.role === 'ADMIN')
  )

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    if (!id) return

    setIsLoading(true)
    setError('')

    Promise.all([getDiscussion(id), listReplies(id)])
      .then(([postData, repliesData]) => {
        if (!active) return
        setPost(postData)
        setReplies(repliesData)
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Discussion not found')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, refreshKey])

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), [])

  async function handleUpdate(input: DiscussionPostInput) {
    if (!post) return
    await updateDiscussion(post.id, input)
    setIsEditing(false)
    refresh()
  }

  async function handleDeletePost() {
    if (!post) return
    const confirmed = window.confirm(
      'Delete this discussion and all of its replies? This cannot be undone.'
    )
    if (!confirmed) return

    try {
      await deleteDiscussion(post.id)
      navigate('/discussions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete discussion')
    }
  }

  async function handleReply(event: FormEvent) {
    event.preventDefault()
    setReplyError('')

    if (!replyDraft.trim()) {
      setReplyError('Reply content is required')
      return
    }
    if (!id) return

    setIsSubmittingReply(true)
    try {
      await createReply(id, { content: replyDraft.trim() })
      setReplyDraft('')
      refresh()
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Failed to create reply')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  async function handleUpdateReply(replyId: string, content: string) {
    await updateReply(replyId, { content })
    refresh()
  }

  async function handleDeleteReply(replyId: string) {
    await deleteReply(replyId)
    refresh()
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner label="Loading" />
          <p className="text-sm text-neutral-500">Loading discussion...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Discussion Not Found</h3>
          <p className="text-sm text-neutral-500 mb-4">{error || 'The requested discussion could not be found.'}</p>
          <Link
            to="/discussions"
            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Back to Discussions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/discussions"
        className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-700 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Discussions
      </Link>

      {isEditing ? (
        <DiscussionForm
          subjects={subjects}
          initial={post}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-neutral-900 mb-3 break-words">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {post.subject && (
                  <Link to={`/subjects/${post.subject.id}`}>
                    <Badge variant="teal">
                      {post.subject.code} — {post.subject.name}
                    </Badge>
                  </Link>
                )}
                <span className="text-xs text-neutral-500">
                  {post.author?.name || 'Unknown'} ·{' '}
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {canModify && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDeletePost}>
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">
          Replies ({replies.length})
        </h2>

        {replies.length === 0 ? (
          <p className="text-sm text-neutral-500 mb-6">
            No replies yet. Be the first to respond.
          </p>
        ) : (
          <div className="space-y-3 mb-6">
            {replies.map((reply) => (
              <DiscussionReply
                key={reply.id}
                reply={reply}
                canModify={Boolean(user && (user.id === reply.authorId || user.role === 'ADMIN'))}
                onUpdate={(content) => handleUpdateReply(reply.id, content)}
                onDelete={() => handleDeleteReply(reply.id)}
              />
            ))}
          </div>
        )}

        <form onSubmit={handleReply} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <label className="block">
            <span className="text-sm font-medium text-neutral-600">Write a reply...</span>
            <textarea
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              rows={3}
              className={`mt-1 ${inputClassName}`}
              placeholder="Share your thoughts on this discussion"
            />
          </label>

          {replyError && <p className="mt-2 text-sm text-red-600">{replyError}</p>}

          <div className="mt-3 flex justify-end">
            <Button type="submit" variant="primary" disabled={isSubmittingReply}>
              {isSubmittingReply ? 'Posting...' : 'Post Reply'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
