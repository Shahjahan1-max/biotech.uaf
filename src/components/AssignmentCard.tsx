import { Link } from 'react-router-dom'
import { AssignmentStatusBadge } from './AssignmentStatusBadge'
import { cn } from '../utils/cn'
import type { Assignment, AssignmentStatus } from '../types/assignment'

interface AssignmentCardProps {
  assignment: Assignment
}

const statusAccents: Record<
  AssignmentStatus,
  { rail: string; dueWell: string; dueText: string }
> = {
  UPCOMING: {
    rail: 'from-emerald-500 via-teal-400 to-cyan-400',
    dueWell: 'bg-emerald-50/70 ring-emerald-600/15',
    dueText: 'text-emerald-700',
  },
  DUE_SOON: {
    rail: 'from-warning to-warning-hover',
    dueWell: 'bg-warning-soft ring-warning/25',
    dueText: 'text-warning-hover',
  },
  OVERDUE: {
    rail: 'from-danger to-danger-hover',
    dueWell: 'bg-danger-soft ring-danger/20',
    dueText: 'text-danger',
  },
}

const fallbackAccent = {
  rail: 'from-neutral-300 to-neutral-400',
  dueWell: 'bg-surface-soft ring-border-subtle',
  dueText: 'text-ink-muted',
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const dueDate = new Date(assignment.dueDate)
  const accent = statusAccents[assignment.status] ?? fallbackAccent

  return (
    <Link
      to={`/assignments/${assignment.id}`}
      className={cn(
        'group relative block overflow-hidden bg-surface rounded-card border border-border-subtle shadow-card p-6',
        'ease-smooth transition-all duration-300',
        'hover:-translate-y-0.5 hover:shadow-float hover:border-emerald-200/70',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
      )}
    >
      <span
        aria-hidden="true"
        className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', accent.rail)}
      />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink-strong line-clamp-2 transition-colors duration-200 group-hover:text-emerald-700">
            {assignment.title}
          </h3>
          <p className="text-sm text-ink-muted line-clamp-1 mt-1">
            {assignment.description || 'No description'}
          </p>
        </div>
        <AssignmentStatusBadge status={assignment.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="min-w-0">
          <p className="text-xs text-ink-muted mb-1.5">Subject</p>
          <span className="inline-flex max-w-full items-center truncate rounded-full bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/15 px-2.5 py-1 text-xs font-semibold tracking-wide">
            {assignment.subject?.code || '—'}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-ink-muted mb-1.5">Due</p>
          <div
            className={cn(
              'flex items-start gap-1.5 rounded-control ring-1 ring-inset px-2.5 py-2 transition-colors duration-200',
              accent.dueWell
            )}
          >
            <svg
              aria-hidden="true"
              className="w-4 h-4 shrink-0 mt-0.5 text-cyan-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 8v4l2.5 2.5m6.5-2.5a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className={cn('text-sm font-semibold leading-snug', accent.dueText)}>
              {dueDate.toLocaleDateString()} {assignment.dueTime}
            </p>
          </div>
        </div>
      </div>

      {assignment.fileName && (
        <p className="mt-3 flex items-center gap-1.5 pt-3 border-t border-border-subtle text-xs text-ink-muted">
          <svg
            aria-hidden="true"
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
            />
          </svg>
          <span className="truncate">Attachment: {assignment.fileName}</span>
        </p>
      )}
    </Link>
  )
}
