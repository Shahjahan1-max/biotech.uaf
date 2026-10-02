import { apiFetch } from './api'
import type { ClassSchedule, ScheduleInput } from '../types/schedule'

export interface ScheduleFilters {
  day?: string
  subjectId?: string
}

function buildQuery(filters: ScheduleFilters = {}): string {
  const params = new URLSearchParams()
  if (filters.day) params.set('day', filters.day)
  if (filters.subjectId) params.set('subjectId', filters.subjectId)

  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function listSchedule(filters: ScheduleFilters = {}): Promise<ClassSchedule[]> {
  const data = await apiFetch<{ schedules: ClassSchedule[] }>(`/schedule${buildQuery(filters)}`)
  return data.schedules
}

export async function createSchedule(schedule: ScheduleInput): Promise<ClassSchedule> {
  const data = await apiFetch<{ schedule: ClassSchedule }>('/schedule', {
    method: 'POST',
    body: JSON.stringify(schedule),
  })
  return data.schedule
}

export async function updateSchedule(
  id: string,
  schedule: ScheduleInput
): Promise<ClassSchedule> {
  const data = await apiFetch<{ schedule: ClassSchedule }>(`/schedule/${id}`, {
    method: 'PUT',
    body: JSON.stringify(schedule),
  })
  return data.schedule
}

export async function deleteSchedule(id: string): Promise<void> {
  await apiFetch(`/schedule/${id}`, { method: 'DELETE' })
}
