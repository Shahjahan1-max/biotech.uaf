import { cn } from '../utils/cn'
import type { AnnouncementPriority } from '../types/announcement'

interface AnnouncementPriorityBadgeProps {
  priority: AnnouncementPriority
}

const PRIORITIES: Record<
  AnnouncementPriority,
  { label: string; className: string; icon: string }
> = {
  NORMAL: {
    label: 'Normal',
    className: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    icon: '•',
  },
  IMPORTANT: {
    label: 'Important',
    className: 'bg-amber-50 text-amber-700 border-amber-300',
    icon: '!',
  },
  URGENT: {
    label: 'Urgent',
    className: 'bg-red-50 text-red-700 border-red-300',
    icon: '!!',
  },
}

export function AnnouncementPriorityBadge({ priority }: AnnouncementPriorityBadgeProps) {
  const config = PRIORITIES[priority] ?? PRIORITIES.NORMAL

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        config.className
      )}
    >
      <span aria-hidden="true" className="font-bold">
        {config.icon}
      </span>
      {config.label}
    </span>
  )
}
