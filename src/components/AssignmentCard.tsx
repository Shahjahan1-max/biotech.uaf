import { Link } from 'react-router-dom'
import { AssignmentStatusBadge } from './AssignmentStatusBadge'
import type { Assignment } from '../types/assignment'

interface AssignmentCardProps {
  assignment: Assignment
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const dueDate = new Date(assignment.dueDate)

  return (
    <Link
      to={`/assignments/${assignment.id}`}
      className="block bg-white rounded-xl border border-neutral-200 p-6 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-neutral-900 line-clamp-2">{assignment.title}</h3>
          <p className="text-sm text-neutral-500 line-clamp-1 mt-1">
            {assignment.description || 'No description'}
          </p>
        </div>
        <AssignmentStatusBadge status={assignment.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-neutral-500">Subject</p>
          <p className="font-medium text-neutral-900">{assignment.subject?.code || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Due</p>
          <p className="font-medium text-emerald-600">
            {dueDate.toLocaleDateString()} {assignment.dueTime}
          </p>
        </div>
      </div>

      {assignment.fileName && (
        <p className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500 truncate">
          Attachment: {assignment.fileName}
        </p>
      )}
    </Link>
  )
}
