import { useRequestStatus } from '../hooks/useRequestStatus'
import { useEffect, useState } from 'react'
import { SectionHeader } from '../components/SectionHeader'
import { ResourceGrid } from '../components/ResourceGrid'
import { ResourceFilters } from '../components/ResourceFilters'
import { FileUpload } from '../components/FileUpload'
import { Button } from '../components/Button'
import { Spinner } from '../components/Spinner'
import { getResources, createResource } from '../services/resources'
import { getSubjects } from '../services/subjects'
import { uploadFile, deleteUpload } from '../services/uploads'
import { useAuth } from '../hooks/useAuth'
import type { StudyResource, ResourceType } from '../types/resource'
import type { Subject } from '../types/subject'

export function Resources() {
  const { user } = useAuth()
  const [resources, setResources] = useState<StudyResource[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedType, setSelectedType] = useState<ResourceType | ''>('')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadFile_, setUploadFile_] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceSubjectId, setResourceSubjectId] = useState('')
  const [resourceType, setResourceType] = useState<ResourceType>('NOTE')

  const isAdmin = user?.role === 'ADMIN'

  const { isLoading, error, setError, setIsLoading } = useRequestStatus(JSON.stringify([selectedSubject]))

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    getResources(selectedSubject || undefined)
      .then((data) => {
        if (active) {
          setResources(data)
          setError('')
        }
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
  }, [selectedSubject, setError, setIsLoading])

  const visibleResources = selectedType
    ? resources.filter((resource) => resource.resourceType === selectedType)
    : resources

  async function handleUpload() {
    if (!uploadFile_) return
    const subjectId = resourceSubjectId || selectedSubject
    if (!subjectId) {
      setUploadError('Choose a subject for this resource.')
      return
    }

    setIsUploading(true)
    setUploadError('')

    try {
      const uploaded = await uploadFile(uploadFile_)
      let resource: StudyResource
      try {
        resource = await createResource({
          title: resourceTitle.trim() || uploaded.originalFileName,
          subjectId,
          resourceType,
          fileName: uploaded.storedFileName,
          originalFileName: uploaded.originalFileName,
          filePath: uploaded.storedFileName,
          fileMimeType: uploaded.mimeType,
          fileSize: uploaded.size,
        })
      } catch (error) {
        await deleteUpload(uploaded.storedFileName).catch(() => {})
        throw error
      }
      if (!selectedSubject || selectedSubject === subjectId) {
        setResources((current) => [resource, ...current])
      }
      setShowUploadForm(false)
      setUploadFile_(null)
      setResourceTitle('')
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
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6 shadow-sm">
          <h3 className="font-semibold text-neutral-900 mb-4">Upload Study Resource</h3>
          <div className="grid gap-4 sm:grid-cols-3 mb-4">
            <label className="text-sm font-medium text-neutral-700">
              Title
              <input value={resourceTitle} onChange={(event) => setResourceTitle(event.target.value)} maxLength={200} placeholder="Defaults to the filename" className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-neutral-700">
              Subject
              <select value={resourceSubjectId || selectedSubject} onChange={(event) => setResourceSubjectId(event.target.value)} required className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2">
                <option value="">Choose a subject</option>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-neutral-700">
              Resource type
              <select value={resourceType} onChange={(event) => setResourceType(event.target.value as ResourceType)} className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2">
                <option value="NOTE">Notes</option>
                <option value="STUDY_GUIDE">Study guide</option>
                <option value="PRESENTATION">Presentation</option>
                <option value="REFERENCE">Reference</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
          </div>
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

      <ResourceFilters
        subjects={subjects}
        selectedSubject={selectedSubject}
        selectedType={selectedType}
        onSubjectChange={setSelectedSubject}
        onTypeChange={setSelectedType}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner label="Loading resources" />
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Error Loading Resources</h3>
          <p className="text-sm text-neutral-500">{error}</p>
        </div>
      )}

      {!isLoading && !error && <ResourceGrid resources={visibleResources} />}
    </div>
  )
}
