import type { StudyResource } from '../types/resource'
import { ResourceTypeBadge } from './ResourceTypeBadge'
import { resolveUploadUrl } from '../services/uploads'

interface ResourceCardProps {
  resource: StudyResource
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const hasFile = !!resource.fileName
  const resourceUrl = resource.url
    ? resolveUploadUrl(resource.url)
    : resource.filePath
      ? resolveUploadUrl(resource.filePath)
      : null

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <ResourceTypeBadge type={resource.resourceType} />
        {resource.subject && (
          <span className="text-xs text-neutral-400">{resource.subject.code}</span>
        )}
      </div>
      <h3 className="font-semibold text-neutral-900 mb-2">{resource.title}</h3>
      <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
        {resource.description || 'No description available.'}
      </p>

      {hasFile && (
        <div className="mb-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="truncate">{resource.originalFileName || resource.fileName}</span>
            {resource.fileSize && (
              <span className="text-xs text-neutral-400 ml-auto">{formatFileSize(resource.fileSize)}</span>
            )}
          </div>
        </div>
      )}

      {resourceUrl ? (
        <a
          href={resourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          {hasFile ? 'Download' : 'Open Resource'}
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      ) : (
        <span className="inline-flex items-center text-sm text-neutral-400">No link available</span>
      )}
    </div>
  )
}
