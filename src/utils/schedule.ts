import { DAY_OF_WEEK, type DayOfWeek } from '../types/schedule'

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
}

export const DAY_LABELS_SHORT: Record<DayOfWeek, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
}

export const SCHOOL_WEEK: DayOfWeek[] = DAY_OF_WEEK.slice(0, 6)

export function dayLabel(day: DayOfWeek, short = false): string {
  return short ? DAY_LABELS_SHORT[day] : DAY_LABELS[day]
}

export function timeRange(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`
}

export function todayDayOfWeek(): DayOfWeek {
  const index = new Date().getDay()
  return DAY_OF_WEEK[(index + 6) % 7]
}
