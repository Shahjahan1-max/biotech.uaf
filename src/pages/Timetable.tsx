import { useRequestStatus } from '../hooks/useRequestStatus'
import { useEffect, useState } from 'react'
import { Spinner } from '../components/Spinner'
import { SectionHeader } from '../components/SectionHeader'
import { ScheduleCard } from '../components/ScheduleCard'
import { ScheduleForm } from '../components/ScheduleForm'
import { Button } from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import {
  listSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../services/schedule'
import { getSubjects } from '../services/subjects'
import { DAY_OF_WEEK, type ClassSchedule, type DayOfWeek, type ScheduleInput } from '../types/schedule'
import { DAY_LABELS, DAY_LABELS_SHORT, SCHOOL_WEEK, dayLabel } from '../utils/schedule'
import type { Subject } from '../types/subject'

const gridColumns: Record<number, string> = {
  1: 'lg:grid-cols-1',
  6: 'lg:grid-cols-6',
  7: 'lg:grid-cols-7',
}

const selectClassName =
  'mt-1 w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'

export function Timetable() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [schedules, setSchedules] = useState<ClassSchedule[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | ''>('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ClassSchedule | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const { isLoading, error, setError, setIsLoading } = useRequestStatus(JSON.stringify([selectedDay, selectedSubjectId, refreshKey]))

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true

    listSchedule({
      day: selectedDay || undefined,
      subjectId: selectedSubjectId || undefined,
    })
      .then((data) => {
        if (active) {
          setSchedules(data)
          setError('')
        }
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load timetable.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedDay, selectedSubjectId, refreshKey, setError, setIsLoading])

  function refresh() {
    setRefreshKey((key) => key + 1)
  }

  async function handleCreate(input: ScheduleInput) {
    await createSchedule(input)
    setShowForm(false)
    refresh()
  }

  async function handleUpdate(input: ScheduleInput) {
    if (!editing) return
    await updateSchedule(editing.id, input)
    setEditing(null)
    refresh()
  }

  async function handleDelete(schedule: ClassSchedule) {
    const confirmed = window.confirm('Delete this class from the timetable?')
    if (!confirmed) return

    try {
      await deleteSchedule(schedule.id)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update the timetable.')
    }
  }

  const hasSundayClasses = schedules.some((schedule) => schedule.dayOfWeek === 'SUNDAY')
  const visibleDays: DayOfWeek[] = selectedDay
    ? [selectedDay]
    : hasSundayClasses
      ? [...SCHOOL_WEEK, 'SUNDAY']
      : SCHOOL_WEEK

  const grouped = visibleDays.map((day) => ({
    day,
    items: schedules.filter((schedule) => schedule.dayOfWeek === day),
  }))

  const formOpen = showForm || editing !== null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader
        as="h1"
        title="Timetable"
        subtitle="Weekly class schedule for Biotechnology Section A"
        action={
          isAdmin ? (
            <Button
              variant="primary"
              onClick={() => {
                setEditing(null)
                setShowForm((open) => !open)
              }}
            >
              {showForm ? 'Cancel' : 'Add Class'}
            </Button>
          ) : undefined
        }
      />

      {isAdmin && formOpen && (
        <ScheduleForm
          subjects={subjects}
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => {
            setEditing(null)
            setShowForm(false)
          }}
        />
      )}

      <div className="mb-6">
        <label className="block">
          <span className="text-sm font-medium text-neutral-600">Subject</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className={selectClassName}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code} — {subject.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="hidden lg:block mb-6">
        <label className="block max-w-xs">
          <span className="text-sm font-medium text-neutral-600">Day</span>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value as DayOfWeek | '')}
            className={selectClassName}
          >
            <option value="">All Days</option>
            {DAY_OF_WEEK.map((day) => (
              <option key={day} value={day}>
                {DAY_LABELS[day]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <button
            type="button"
            onClick={() => setSelectedDay('')}
            className={
              selectedDay === ''
                ? 'px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white'
                : 'px-3 py-2 rounded-lg text-sm font-medium bg-white border border-neutral-300 text-neutral-600'
            }
          >
            All
          </button>
          {DAY_OF_WEEK.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={
                selectedDay === day
                  ? 'px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white'
                  : 'px-3 py-2 rounded-lg text-sm font-medium bg-white border border-neutral-300 text-neutral-600'
              }
            >
              {DAY_LABELS_SHORT[day]}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner label="Loading" />
          <p className="text-sm text-neutral-500">Loading timetable...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Unable to load timetable.</h3>
          <p className="text-sm text-neutral-500">{error}</p>
        </div>
      )}

      {!isLoading && !error && schedules.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">No classes scheduled.</h3>
          <p className="text-sm text-neutral-500">
            {isAdmin
              ? 'Add your first class to build the timetable.'
              : 'Your timetable has not been published yet.'}
          </p>
        </div>
      )}

      {!isLoading && !error && schedules.length > 0 && (
        <>
          <div
            className={`hidden lg:grid gap-4 ${gridColumns[visibleDays.length] ?? 'lg:grid-cols-6'}`}
          >
            {grouped.map(({ day, items }) => (
              <div key={day} className="min-w-0">
                <div className="mb-3 pb-2 border-b border-neutral-200">
                  <h3 className="text-sm font-semibold text-neutral-900">{dayLabel(day)}</h3>
                  <p className="text-xs text-neutral-400">
                    {items.length} {items.length === 1 ? 'class' : 'classes'}
                  </p>
                </div>
                <div className="space-y-3">
                  {items.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onEdit={
                        isAdmin
                          ? (item) => {
                              setShowForm(false)
                              setEditing(item)
                            }
                          : undefined
                      }
                      onDelete={isAdmin ? handleDelete : undefined}
                    />
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs text-neutral-400">No classes</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:hidden space-y-6">
            {grouped.map(({ day, items }) => (
              <div key={day}>
                <div className="mb-3 pb-2 border-b border-neutral-200">
                  <h3 className="text-sm font-semibold text-neutral-900">{dayLabel(day)}</h3>
                  <p className="text-xs text-neutral-400">
                    {items.length} {items.length === 1 ? 'class' : 'classes'}
                  </p>
                </div>
                <div className="space-y-3">
                  {items.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onEdit={
                        isAdmin
                          ? (item) => {
                              setShowForm(false)
                              setEditing(item)
                            }
                          : undefined
                      }
                      onDelete={isAdmin ? handleDelete : undefined}
                    />
                  ))}
                  {items.length === 0 && (
                    <p className="text-sm text-neutral-400">No classes scheduled.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
