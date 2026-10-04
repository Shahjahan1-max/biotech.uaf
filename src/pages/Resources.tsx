import { useEffect, useState } from 'react'
import { SectionHeader } from '../components/SectionHeader'
import { ResourceGrid } from '../components/ResourceGrid'
import { ResourceFilters } from '../components/ResourceFilters'
import { FileUpload } from '../components/FileUpload'
import { Button } from '../components/Button'
import { getResources, createResource, updateResource, deleteResource } from '../services/resources'
import { getSubjects } from '../services/subjects'
import { uploadFile, deleteUpload } from '../services/uploads'
import { useAuth } from '../hooks/useAuth'
import type { StudyResource, ResourceType } from '../types/resource'
import type { Subject } from '../types/subject'

const inputClassName =
  'w-full px-3 py-2.5 border border-border-subtle rounded-control text-sm bg-surface text-ink-strong placeholder:text-ink-muted transition-colors duration-150 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500'

const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  NOTE: 'Lecture Note',
  STUDY_GUIDE: 'Study Guide',
  PRESENTATION: 'Presentation',
  REFERENCE: 'Reference',
  OTHER: 'Other',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function Resources() {
  const { user } = useAuth()
  const [resources, setResources] = useState<StudyResource[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedType, setSelectedType] = useState<ResourceType | ''>('')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadFile_, setUploadFile_] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceSubjectId, setResourceSubjectId] = useState('')
  const [resourceType, setResourceType] = useState<ResourceType>('NOTE')
  const [resourceDescription, setResourceDescription] = useState('')
  const [editing, setEditing] = useState<StudyResource | null>(null)

  const isAdmin = user?.role === 'ADMIN'
  const formOpen = isAdmin && (showUploadForm || editing !== null)

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError('')
    getResources(selectedSubject || undefined)
      .then((data) => {
        if (active) setResources(data)
      })
      .catch(() => {
        if (active) setError('Failed to load resources')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedSubject])

  const visibleResources = selectedType
    ? resources.filter((resource) => resource.resourceType === selectedType)
    : resources

  async function handleUpload() {
    if (!uploadFile_) return

    const subjectId = resourceSubjectId || selectedSubject
    if (!subjectId) {
      setUploadError('Subject is required')
      return
    }

    setIsUploading(true)
    setUploadError('')

    let uploaded: Awaited<ReturnType<typeof uploadFile>> | null = null
    try {
      uploaded = await uploadFile(uploadFile_)
      await createResource({
        title: resourceTitle.trim() || uploaded.originalFileName,
        description: resourceDescription.trim() || null,
        subjectId,
        resourceType,
        fileName: uploaded.storedFileName,
        originalFileName: uploaded.originalFileName,
        filePath: uploaded.storedFileName,
        fileMimeType: uploaded.mimeType,
        fileSize: uploaded.size,
      })
      setShowUploadForm(false)
      setUploadFile_(null)
      setResourceTitle('')
      setResourceDescription('')
      setResourceSubjectId('')
      getResources(selectedSubject || undefined).then(setResources).catch(() => {})
    } catch (err) {
      if (uploaded) {
        await deleteUpload(uploaded.storedFileName).catch(() => {})
      }
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  function resetFormFields() {
    setResourceTitle('')
    setResourceDescription('')
    setResourceType('NOTE')
    setResourceSubjectId('')
    setUploadFile_(null)
    setUploadError('')
  }

  function startEdit(resource: StudyResource) {
    setShowUploadForm(false)
    setUploadFile_(null)
    setUploadError('')
    setResourceTitle(resource.title)
    setResourceDescription(resource.description ?? '')
    setResourceType(resource.resourceType)
    setResourceSubjectId(resource.subjectId)
    setEditing(resource)
  }

  function handleCancelForm() {
    setEditing(null)
    setShowUploadForm(false)
    resetFormFields()
  }

  async function handleUpdate() {
    if (!editing) return

    const title = resourceTitle.trim()
    if (!title) {
      setUploadError('Title is required')
      return
    }
    const subjectId = resourceSubjectId || selectedSubject
    if (!subjectId) {
      setUploadError('Subject is required')
      return
    }

    setIsUploading(true)
    setUploadError('')

    try {
      await updateResource(editing.id, {
        title,
        description: resourceDescription.trim() || null,
        resourceType,
        subjectId,
      })
      handleCancelForm()
      getResources(selectedSubject || undefined).then(setResources).catch(() => {})
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to update resource')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDelete(resource: StudyResource) {
    const confirmed = window.confirm(
      'Delete this resource? The uploaded file will also be removed. This cannot be undone.'
    )
    if (!confirmed) return

    try {
      await deleteResource(resource.id)
      if (editing?.id === resource.id) {
        handleCancelForm()
      } else {
        setUploadError('')
      }
      getResources(selectedSubject || undefined).then(setResources).catch(() => {})
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to delete resource')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader
        as="h1"
        title="Study Resources"
        subtitle="Access lecture notes, study guides, and reference materials"
        action={isAdmin && (
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null)
              resetFormFields()
              setShowUploadForm((open) => !open)
            }}
          >
            {showUploadForm ? 'Cancel' : 'Upload File'}
          </Button>
        )}
      />

      {formOpen && (
        <div className="bg-surface rounded-card border border-border-subtle p-6 mb-6 shadow-card ease-smooth">
          <h3 className="font-semibold text-ink-strong mb-4">
            {editing ? 'Edit Study Resource' : 'Upload Study Resource'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-ink-muted">Title</span>
              <input
                type="text"
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
                maxLength={200}
                className={`mt-1 ${inputClassName}`}
                placeholder="Defaults to the filename"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink-muted">Subject</span>
              <select
                value={resourceSubjectId || selectedSubject}
                onChange={(e) => setResourceSubjectId(e.target.value)}
                className={`mt-1 ${inputClassName}`}
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink-muted">Resource type</span>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as ResourceType)}
                className={`mt-1 ${inputClassName}`}
              >
                {(Object.keys(RESOURCE_TYPE_LABELS) as ResourceType[]).map((type) => (
                  <option key={type} value={type}>
                    {RESOURCE_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-ink-muted">
                Description <span className="text-ink-muted font-normal">(optional)</span>
              </span>
              <textarea
                value={resourceDescription}
                onChange={(e) => setResourceDescription(e.target.value)}
                maxLength={5000}
                rows={3}
                className={`mt-1 ${inputClassName}`}
                placeholder="What this resource covers"
              />
            </label>
          </div>

          {editing ? (
            <div className="mt-4 p-3 bg-surface-soft border border-border-subtle rounded-control">
              <p className="text-xs font-medium text-ink-muted mb-1">
                {editing.fileName ? 'Current file' : 'Attachment'}
              </p>
              {editing.fileName ? (
                <div className="flex items-center gap-2 text-sm text-ink min-w-0">
                  <span className="truncate">
                    {editing.originalFileName || editing.fileName}
                  </span>
                  {editing.fileSize != null && (
                    <span className="text-xs text-ink-muted ml-auto shrink-0">
                      {formatFileSize(editing.fileSize)}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-ink-muted">No file attached.</p>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <FileUpload
                onFileSelect={setUploadFile_}
                onFileRemove={() => setUploadFile_(null)}
                isUploading={isUploading}
                error={uploadError}
              />
            </div>
          )}

          {editing && uploadError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {uploadError}
            </p>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelForm} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={editing ? handleUpdate : handleUpload}
              disabled={editing ? isUploading : !uploadFile_ || isUploading}
            >
              {isUploading
                ? editing
                  ? 'Saving...'
                  : 'Uploading...'
                : editing
                  ? 'Save Changes'
                  : 'Upload'}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-card border border-border-subtle p-4 mb-6 shadow-card ease-smooth">
        <ResourceFilters
          subjects={subjects}
          selectedSubject={selectedSubject}
          selectedType={selectedType}
          onSubjectChange={setSelectedSubject}
          onTypeChange={setSelectedType}
        />
      </div>

      {!formOpen && uploadError && (
        <div
          role="alert"
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-card text-sm text-red-700"
        >
          {uploadError}
        </div>
      )}

      {isLoading && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          role="status"
          aria-label="Loading resources"
        >
          <span className="sr-only">Loading resources</span>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className="p-5 bg-surface rounded-card border border-border-subtle shadow-card animate-pulse"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="h-5 w-20 rounded-full bg-neutral-200/70" />
                <div className="h-3 w-10 rounded bg-neutral-100" />
              </div>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 shrink-0 rounded-control bg-neutral-200/70" />
                <div className="h-4 w-3/5 rounded bg-neutral-200/70 mt-1" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 w-full rounded bg-neutral-100" />
                <div className="h-3 w-4/5 rounded bg-neutral-100" />
              </div>
              <div className="p-3 mb-4 bg-surface-soft rounded-control border border-border-subtle">
                <div className="h-3.5 w-2/3 rounded bg-neutral-200/70" />
              </div>
              <div className="h-3.5 w-24 rounded bg-neutral-200/70" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-surface rounded-card border border-border-subtle shadow-card p-6">
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500 ring-1 ring-inset ring-red-600/20"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </span>
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-1">Error Loading Resources</h3>
              <p className="text-sm text-ink-muted">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <ResourceGrid
          resources={visibleResources}
          onEdit={isAdmin ? startEdit : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
        />
      )}
    </div>
  )
}
