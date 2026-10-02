import type { Subject } from './subject'

export const DAY_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const

export type DayOfWeek = (typeof DAY_OF_WEEK)[number]

export interface ScheduleInput {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  instructor: string
  room: string
  subjectId: string
}

export interface ClassSchedule {
  id: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  instructor: string
  room: string
  subjectId: string
  subject?: Subject
  createdAt: Date
  updatedAt: Date
}
