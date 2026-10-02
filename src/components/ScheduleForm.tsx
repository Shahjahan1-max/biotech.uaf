import { useState, type FormEvent } from 'react'
import { Button } from './Button'
import { DAY_OF_WEEK, type ClassSchedule, type DayOfWeek, type ScheduleInput } from '../types/schedule'
import { DAY_LABELS, timeRange } from '../utils/schedule'
import type { Subject } from '../types/subject'

interface ScheduleFormProps {
  subjects: Subject[]
  initial?: ClassSchedule | null
  onSubmit: (input: ScheduleInput) => Promise<void>
  onCancel: () => void
}

const inputClassName =
  'w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'

const TIME_PATTERN = /^([01][0-9]|2[0-3]):[0-5][0-9]$/

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function ScheduleForm({ subjects, initial, onSubmit, onCancel }: ScheduleFormProps) {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek | ''>(initial?.dayOfWeek ?? '')
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? '')
  const [startTime, setStartTime] = useState(initial?.startTime ?? '')
  const [endTime, setEndTime] = useState(initial?.endTime ?? '')
  const [instructor, setInstructor] = useState(initial?.instructor ?? '')
  const [room, setRoom] = useState(initial?.room ?? '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function validate(): string {
    if (!dayOfWeek) return 'Please select a day'
    if (!subjectId) return 'Please select a subject'
    if (!startTime) return 'Start time is required'
    if (!TIME_PATTERN.test(startTime)) return 'Start time must be a valid time'
    if (!endTime) return 'End time is required'
    if (!TIME_PATTERN.test(endTime)) return 'End time must be a valid time'
    if (toMinutes(endTime) <= toMinutes(startTime)) return 'End time must be after start time'
    if (!instructor.trim()) return 'Instructor is required'
    if (instructor.trim().length > 120) return 'Instructor must be 120 characters or fewer'
    if (!room.trim()) return 'Room is required'
    if (room.trim().length > 120) return 'Room must be 120 characters or fewer'
    return ''
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)
    try {
      await onSubmit({
        dayOfWeek: dayOfWeek as DayOfWeek,
        subjectId,
        startTime,
        endTime,
        instructor: instructor.trim(),
        room: room.trim(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save class')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-neutral-200 p-6 mb-6 shadow-sm"
    >
      <h3 className="font-semibold text-neutral-900 mb-4">
        {initial ? 'Edit Class' : 'Add Class'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Day</span>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek | '')}
            className={`mt-1 ${inputClassName}`}
          >
            <option value="">Select a day</option>
            {DAY_OF_WEEK.map((day) => (
              <option key={day} value={day}>
                {DAY_LABELS[day]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Subject</span>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className={`mt-1 ${inputClassName}`}
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code} — {subject.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Start time</span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={`mt-1 ${inputClassName}`}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-600">End time</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={`mt-1 ${inputClassName}`}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Instructor</span>
          <input
            type="text"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            className={`mt-1 ${inputClassName}`}
            placeholder="e.g. Dr. Patel"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Room</span>
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className={`mt-1 ${inputClassName}`}
            placeholder="e.g. Lab 2A"
          />
        </label>
      </div>

      {startTime && endTime && TIME_PATTERN.test(startTime) && TIME_PATTERN.test(endTime) && (
        <p className="mt-3 text-xs text-neutral-500">
          {dayOfWeek ? `${DAY_LABELS[dayOfWeek]} · ` : ''}
          {timeRange(startTime, endTime)}
        </p>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : initial ? 'Save Changes' : 'Add Class'}
        </Button>
      </div>
    </form>
  )
}
