import { Badge } from './Badge'
import { Button } from './Button'
import { timeRange } from '../utils/schedule'
import type { ClassSchedule } from '../types/schedule'

interface ScheduleCardProps {
  schedule: ClassSchedule
  onEdit?: (schedule: ClassSchedule) => void
  onDelete?: (schedule: ClassSchedule) => void
}

export function ScheduleCard({ schedule, onEdit, onDelete }: ScheduleCardProps) {
  const subjectName = schedule.subject?.name ?? 'Subject'

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-emerald-600">
          {timeRange(schedule.startTime, schedule.endTime)}
        </span>
        {schedule.subject && <Badge variant="teal">{schedule.subject.code}</Badge>}
      </div>

      <h4 className="mt-2 font-medium text-neutral-900">{subjectName}</h4>

      <dl className="mt-3 space-y-1 text-xs text-neutral-500">
        <div className="flex gap-2">
          <dt className="w-16 flex-shrink-0 text-neutral-400">Instructor</dt>
          <dd className="min-w-0 truncate text-neutral-600">{schedule.instructor}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 flex-shrink-0 text-neutral-400">Room</dt>
          <dd className="min-w-0 truncate text-neutral-600">{schedule.room}</dd>
        </div>
      </dl>

      {(onEdit || onDelete) && (
        <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-end gap-2">
          {onEdit && (
            <Button size="sm" variant="outline" onClick={() => onEdit(schedule)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="ghost" onClick={() => onDelete(schedule)}>
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
