import type { ResourceType } from '../types/resource'
import { cn } from '../utils/cn'

const typeConfig: Record<ResourceType, { label: string; className: string }> = {
  NOTE: { label: 'Lecture Note', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  STUDY_GUIDE: { label: 'Study Guide', className: 'bg-teal-50 text-teal-700 border-teal-200' },
  PRESENTATION: { label: 'Presentation', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  REFERENCE: { label: 'Reference', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  OTHER: { label: 'Other', className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
}

interface ResourceTypeBadgeProps {
  type: ResourceType
}

export function ResourceTypeBadge({ type }: ResourceTypeBadgeProps) {
  const config = typeConfig[type]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', config.className)}>
      {config.label}
    </span>
  )
}
