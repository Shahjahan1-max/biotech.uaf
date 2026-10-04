import { useEffect, useState } from 'react'
import { SectionHeader } from '../components/SectionHeader'
import { ResourceGrid } from '../components/ResourceGrid'
import { ResourceFilters } from '../components/ResourceFilters'
import { FileUpload } from '../components/FileUpload'
import { Button } from '../components/Button'
import { getResources } from '../services/resources'
import { getSubjects } from '../services/subjects'
import { uploadFile } from '../services/uploads'
import { useAuth } from '../hooks/useAuth'
import type { StudyResource, ResourceType } from '../types/resource'
import type { Subject } from '../types/subject'

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

  const isAdmin = user?.role === 'ADMIN'

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

    setIsUploading(true)
    setUploadError('')

    try {
      await uploadFile(uploadFile_)
      setShowUploadForm(false)
      setUploadFile_(null)
      getResources(selectedSubject || undefined).then(setResources).catch(() => {})
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader
        as="h1"
        title="Study Resources"
        subtitle="Access lecture notes, study guides, and reference materials"
        action={isAdmin && (
          <Button variant="primary" onClick={() => setShowUploadForm(!showUploadForm)}>
            {showUploadForm ? 'Cancel' : 'Upload File'}
          </Button>
        )}
      />

      {showUploadForm && isAdmin && (
        <div className="bg-surface rounded-card border border-border-subtle p-6 mb-6 shadow-card ease-smooth">
          <h3 className="font-semibold text-ink-strong mb-4">Upload Study Resource</h3>
          <FileUpload
            onFileSelect={setUploadFile_}
            onFileRemove={() => setUploadFile_(null)}
            isUploading={isUploading}
            error={uploadError}
          />
          <div className="mt-4 flex justify-end">
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!uploadFile_ || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
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

      {!isLoading && !error && <ResourceGrid resources={visibleResources} />}
    </div>
  )
}
