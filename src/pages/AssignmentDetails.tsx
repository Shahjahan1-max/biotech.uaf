import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AssignmentStatusBadge } from '../components/AssignmentStatusBadge'
import { Button } from '../components/Button'
import { Spinner } from '../components/Spinner'
import { getAssignment } from '../services/assignments'
import { fetchFileUrl } from '../services/uploads'
import type { Assignment } from '../types/assignment'

export function AssignmentDetails() {
  const { id } = useParams<{ id: string }>()
  return <AssignmentDetailsContent key={id} id={id} />
}

function AssignmentDetailsContent({ id }: { id?: string }) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(id))
  const [error, setError] = useState(id ? '' : 'The requested assignment could not be found.')
  const [attachmentError, setAttachmentError] = useState('')
  const [isLoadingFile, setIsLoadingFile] = useState(false)

  useEffect(() => {
    if (!id) return

    getAssignment(id)
      .then(setAssignment)
      .catch(() => setError('Failed to load assignment'))
      .finally(() => setIsLoading(false))
  }, [id])

  async function handleViewAttachment() {
    if (!assignment?.filePath) return

    setIsLoadingFile(true)
    setAttachmentError('')

    const newWindow = window.open('', '_blank')
    if (!newWindow) {
      setIsLoadingFile(false)
      setAttachmentError('The new tab was blocked. Please allow popups for this site and try again.')
      return
    }

    try {
      const url = await fetchFileUrl(assignment.filePath)
      newWindow.location.href = url
      try {
        newWindow.opener = null
      } catch {
        // detached opener is best effort
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (err) {
      newWindow.close()
      setAttachmentError(err instanceof Error ? err.message : 'Failed to load attachment')
    } finally {
      setIsLoadingFile(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-center">
          <Spinner label="Loading assignment" />
        </div>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Assignment Not Found</h3>
          <p className="text-sm text-neutral-500 mb-4">
            {error || 'The requested assignment could not be found.'}
          </p>
          <Link
            to="/assignments"
            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Assignments
          </Link>
        </div>
      </div>
    )
  }

  const dueDate = new Date(assignment.dueDate)

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link
        to="/assignments"
        className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-700 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Assignments
      </Link>

      <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-neutral-900">{assignment.title}</h1>
          <AssignmentStatusBadge status={assignment.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Subject</p>
            <p className="font-medium text-neutral-900 mt-1">
              {assignment.subject
                ? `${assignment.subject.code} — ${assignment.subject.name}`
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Due</p>
            <p className="font-medium text-neutral-900 mt-1">
              {dueDate.toLocaleDateString()} {assignment.dueTime}
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-6">
          <p className="text-neutral-700 leading-relaxed">
            {assignment.description || 'No description available.'}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-200">
          <p className="text-sm font-medium text-neutral-500 mb-3">Attachment</p>
          {assignment.fileName ? (
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="text-sm text-neutral-600 truncate">{assignment.fileName}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAttachment}
                disabled={isLoadingFile}
                className="ml-4 flex-shrink-0"
              >
                {isLoadingFile ? 'Loading...' : 'View'}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No file attached to this assignment.</p>
          )}
          {attachmentError && <p className="mt-2 text-sm text-red-600">{attachmentError}</p>}
        </div>
      </div>
    </div>
  )
}
