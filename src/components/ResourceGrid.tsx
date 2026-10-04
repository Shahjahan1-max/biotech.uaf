import type { StudyResource } from '../types/resource'
import { ResourceCard } from './ResourceCard'

interface ResourceGridProps {
  resources: StudyResource[]
  onEdit?: (resource: StudyResource) => void
  onDelete?: (resource: StudyResource) => void
}

export function ResourceGrid({ resources, onEdit, onDelete }: ResourceGridProps) {
  if (resources.length === 0) {
    return (
      <div className="bg-surface rounded-card border border-border-subtle shadow-card p-6">
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/10"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No Study Resources</h3>
            <p className="text-sm text-ink-muted">
              No study resources have been added yet.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
