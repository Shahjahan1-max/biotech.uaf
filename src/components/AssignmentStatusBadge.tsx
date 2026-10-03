import { cn } from '../utils/cn'

type AssignmentStatus = 'UPCOMING' | 'DUE_SOON' | 'OVERDUE'

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus
}

const statusLabels: Record<AssignmentStatus, { className: string; label: string }> = {
  UPCOMING: { className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15', label: 'Upcoming' },
  DUE_SOON: { className: 'bg-teal-50 text-teal-700 ring-teal-600/15', label: 'Due Soon' },
  OVERDUE: { className: 'bg-red-50 text-red-700 ring-red-600/20', label: 'Overdue' },
}

const fallbackConfig = {
  className: 'bg-neutral-100 text-neutral-600 ring-neutral-500/15',
  label: 'Unknown',
}

export function AssignmentStatusBadge({ status }: AssignmentStatusBadgeProps) {
  const config = statusLabels[status] ?? fallbackConfig
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ring-1 ring-inset transition-colors duration-200',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
