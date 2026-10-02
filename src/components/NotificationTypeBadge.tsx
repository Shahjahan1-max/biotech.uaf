import { cn } from '../utils/cn'
import type { NotificationType } from '../types/notification'

interface NotificationTypeBadgeProps {
  type: NotificationType
}

const TYPES: Record<NotificationType, { label: string; className: string; icon: string }> = {
  ANNOUNCEMENT: {
    label: 'Announcement',
    className: 'bg-teal-50 text-teal-700 border-teal-300',
    icon: '◆',
  },
  ASSIGNMENT: {
    label: 'Assignment',
    className: 'bg-amber-50 text-amber-700 border-amber-300',
    icon: '▲',
  },
  DISCUSSION_REPLY: {
    label: 'Discussion Reply',
    className: 'bg-blue-50 text-blue-700 border-blue-300',
    icon: '●',
  },
  RESOURCE: {
    label: 'Study Resource',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    icon: '■',
  },
  SCHEDULE: {
    label: 'Timetable',
    className: 'bg-purple-50 text-purple-700 border-purple-300',
    icon: '◇',
  },
  SYSTEM: {
    label: 'System',
    className: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    icon: '○',
  },
}

export function NotificationTypeBadge({ type }: NotificationTypeBadgeProps) {
  const config = TYPES[type] ?? TYPES.SYSTEM

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        config.className
      )}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  )
}
