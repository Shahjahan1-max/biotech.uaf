import { cn } from '../utils/cn'

type AssignmentStatus = 'UPCOMING' | 'DUE_SOON' | 'OVERDUE'

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus
}

const statusLabels: Record<AssignmentStatus, { className: string; label: string }> = {
  UPCOMING: { className: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Upcoming' },
  DUE_SOON: { className: 'bg-teal-100 text-teal-700 border-teal-200', label: 'Due Soon' },
  OVERDUE: { className: 'bg-red-100 text-red-700 border-red-200', label: 'Overdue' },
}

const fallbackConfig = {
  className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  label: 'Unknown',
}

export function AssignmentStatusBadge({ status }: AssignmentStatusBadgeProps) {
  const config = statusLabels[status] ?? fallbackConfig
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', config.className)}>
      {config.label}
    </span>
  )
}
