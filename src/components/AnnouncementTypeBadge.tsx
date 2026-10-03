import { cn } from '../utils/cn'
import type { AnnouncementType } from '../types/announcement'

interface AnnouncementTypeBadgeProps {
  type: AnnouncementType
}

const TYPE_LABELS: Record<AnnouncementType, string> = {
  GENERAL: 'General',
  ASSIGNMENT: 'Assignment',
  QUIZ: 'Quiz',
  EXAM: 'Exam',
  LECTURE: 'Lecture',
  SCHEDULE: 'Schedule',
  RESOURCE: 'Resource',
  OTHER: 'Other',
}

export function AnnouncementTypeBadge({ type }: AnnouncementTypeBadgeProps) {
  const label = TYPE_LABELS[type] ?? 'Other'

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ring-1 ring-inset transition-colors duration-200',
        'bg-teal-50 text-teal-700 ring-teal-600/15'
      )}
    >
      {label}
    </span>
  )
}
