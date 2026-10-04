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
    <div className="group flex flex-col h-full bg-surface rounded-card border border-border-subtle p-5 shadow-card ease-smooth transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float hover:border-emerald-200/70">
      <div className="flex items-center justify-between gap-3 mb-4 min-w-0">
        <ResourceTypeBadge type={resource.resourceType} />
        {resource.subject && (
          <span className="text-xs text-ink-muted truncate min-w-0">
            {resource.subject.code} · {resource.subject.name}
          </span>
        )}
      </div>

      <div className="flex items-start gap-3 mb-3 min-w-0">
        <span
          aria-hidden="true"
          className="w-10 h-10 shrink-0 rounded-control flex items-center justify-center bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-ink-strong leading-snug">{resource.title}</h3>
        </div>
      </div>

      <p className="text-sm text-ink-muted line-clamp-2 mb-4">
        {resource.description || 'No description available.'}
      </p>

      {hasFile && (
        <div className="mb-4 p-3 bg-surface-soft rounded-control border border-border-subtle">
          <div className="flex items-center gap-2 text-sm text-ink min-w-0">
            <svg className="w-4 h-4 shrink-0 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="truncate">{resource.originalFileName || resource.fileName}</span>
            {resource.fileSize && (
              <span className="text-xs text-ink-muted ml-auto shrink-0">{formatFileSize(resource.fileSize)}</span>
            )}
          </div>
        </div>
      )}

      <div className="mt-auto">
        {resourceUrl ? (
          <a
            href={resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors duration-150 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {hasFile ? 'Download' : 'Open Resource'}
            <svg
              className="w-4 h-4 ml-1 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : (
          <span className="inline-flex items-center text-sm text-ink-muted">No link available</span>
        )}
      </div>
    </div>
  )
}
