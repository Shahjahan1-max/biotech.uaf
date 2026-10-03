import type { DayOfWeek as PrismaDayOfWeek } from '@prisma/client'
import { prisma } from '../utils/prisma.js'
import type { ClassSchedule, DayOfWeek, ScheduleInput } from '../types/schedule.js'
import { DAY_OF_WEEK } from '../types/schedule.js'
import { notifyStudents, safeNotify } from './notificationService.js'


const TIME_PATTERN = /^([01][0-9]|2[0-3]):[0-5][0-9]$/
const MAX_TEXT_LENGTH = 120

export class ScheduleValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ScheduleValidationError'
  }
}

export class ScheduleNotFoundError extends Error {
  constructor() {
    super('Schedule not found')
    this.name = 'ScheduleNotFoundError'
  }
}

function isDayOfWeek(value: unknown): value is DayOfWeek {
  return typeof value === 'string' && (DAY_OF_WEEK as readonly string[]).includes(value)
}

function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_PATTERN.test(value)
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function dayIndex(day: DayOfWeek): number {
  return DAY_OF_WEEK.indexOf(day)
}

function hasControlCharacters(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code < 32 || code === 127) return true
  }
  return false
}

function cleanText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ScheduleValidationError(`${field} is required`)
  }

  const cleaned = value.trim()
  if (cleaned.length > MAX_TEXT_LENGTH) {
    throw new ScheduleValidationError(`${field} must be ${MAX_TEXT_LENGTH} characters or fewer`)
  }
  if (hasControlCharacters(cleaned)) {
    throw new ScheduleValidationError(`${field} contains invalid characters`)
  }

  return cleaned
}

function validateInput(input: ScheduleInput): ScheduleInput {
  if (!isDayOfWeek(input.dayOfWeek)) {
    throw new ScheduleValidationError('Day must be a valid day of the week')
  }
  if (!isValidTime(input.startTime)) {
    throw new ScheduleValidationError('Start time must be a valid time in HH:MM format')
  }
  if (!isValidTime(input.endTime)) {
    throw new ScheduleValidationError('End time must be a valid time in HH:MM format')
  }
  if (toMinutes(input.endTime) <= toMinutes(input.startTime)) {
    throw new ScheduleValidationError('End time must be after start time')
  }
  if (typeof input.subjectId !== 'string' || input.subjectId.trim().length === 0) {
    throw new ScheduleValidationError('Subject is required')
  }

  return {
    dayOfWeek: input.dayOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
    subjectId: input.subjectId.trim(),
    instructor: cleanText(input.instructor, 'Instructor'),
    room: cleanText(input.room, 'Room'),
  }
}

async function assertSubjectExists(subjectId: string): Promise<void> {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
  if (!subject) throw new ScheduleValidationError('Subject not found')
}

async function findConflict(
  dayOfWeek: DayOfWeek,
  startTime: string,
  endTime: string,
  excludeId?: string
): Promise<ClassSchedule | null> {
  const candidates = await prisma.classSchedule.findMany({
    where: { dayOfWeek, ...(excludeId ? { id: { not: excludeId } } : {}) },
    include: { subject: true },
  })

  const start = toMinutes(startTime)
  const end = toMinutes(endTime)

  const conflict = candidates.find((candidate) => {
    const candidateStart = toMinutes(candidate.startTime)
    const candidateEnd = toMinutes(candidate.endTime)
    return start < candidateEnd && candidateStart < end
  })

  return conflict ? toSchedule(conflict) : null
}

function toSchedule(record: {
  id: string
  dayOfWeek: PrismaDayOfWeek
  startTime: string
  endTime: string
  instructor: string
  room: string
  subjectId: string
  subject?: { id: string; name: string; code: string; description: string | null; createdAt: Date; updatedAt: Date }
  createdAt: Date
  updatedAt: Date
}): ClassSchedule {
  return {
    id: record.id,
    dayOfWeek: record.dayOfWeek as DayOfWeek,
    startTime: record.startTime,
    endTime: record.endTime,
    instructor: record.instructor,
    room: record.room,
    subjectId: record.subjectId,
    subject: record.subject,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function sortChronologically(schedules: ClassSchedule[]): ClassSchedule[] {
  return [...schedules].sort((a, b) => {
    const dayDifference = dayIndex(a.dayOfWeek) - dayIndex(b.dayOfWeek)
    if (dayDifference !== 0) return dayDifference

    const startDifference = toMinutes(a.startTime) - toMinutes(b.startTime)
    if (startDifference !== 0) return startDifference

    return toMinutes(a.endTime) - toMinutes(b.endTime)
  })
}

export async function getSchedules(filters: {
  day?: string
  subjectId?: string
} = {}): Promise<ClassSchedule[]> {
  const where: { dayOfWeek?: DayOfWeek; subjectId?: string } = {}

  if (filters.day) {
    if (!isDayOfWeek(filters.day)) {
      throw new ScheduleValidationError('Day must be a valid day of the week')
    }
    where.dayOfWeek = filters.day
  }

  if (filters.subjectId) where.subjectId = filters.subjectId

  const schedules = await prisma.classSchedule.findMany({
    where,
    include: { subject: true },
  })

  return sortChronologically(schedules.map(toSchedule))
}

export async function getScheduleById(id: string): Promise<ClassSchedule | null> {
  const schedule = await prisma.classSchedule.findUnique({
    where: { id },
    include: { subject: true },
  })
  return schedule ? toSchedule(schedule) : null
}

export async function createSchedule(input: ScheduleInput): Promise<ClassSchedule> {
  const validated = validateInput(input)
  await assertSubjectExists(validated.subjectId)

  const conflict = await findConflict(validated.dayOfWeek, validated.startTime, validated.endTime)
  if (conflict) {
    throw new ScheduleValidationError(
      `Conflicts with ${conflict.subject?.name ?? 'another class'} on ${conflict.dayOfWeek} ` +
        `(${conflict.startTime}–${conflict.endTime})`
    )
  }

  const schedule = await prisma.classSchedule.create({
    data: validated,
    include: { subject: true },
  })

  await safeNotify(
    () =>
      notifyStudents({
        type: 'SCHEDULE',
        title: `Class scheduled: ${schedule.subject.name}`,
        message: `${schedule.dayOfWeek} · ${schedule.startTime}–${schedule.endTime}${schedule.room ? ` · ${schedule.room}` : ''}`,
        link: '/timetable',
      }),
    'schedule-create'
  )

  return toSchedule(schedule)
}

export async function updateSchedule(id: string, input: ScheduleInput): Promise<ClassSchedule> {
  const existing = await prisma.classSchedule.findUnique({ where: { id } })
  if (!existing) throw new ScheduleNotFoundError()

  const validated = validateInput(input)
  await assertSubjectExists(validated.subjectId)

  const conflict = await findConflict(
    validated.dayOfWeek,
    validated.startTime,
    validated.endTime,
    id
  )
  if (conflict) {
    throw new ScheduleValidationError(
      `Conflicts with ${conflict.subject?.name ?? 'another class'} on ${conflict.dayOfWeek} ` +
        `(${conflict.startTime}–${conflict.endTime})`
    )
  }

  const schedule = await prisma.classSchedule.update({
    where: { id },
    data: validated,
    include: { subject: true },
  })

  await safeNotify(
    () =>
      notifyStudents({
        type: 'SCHEDULE',
        title: `Schedule updated: ${schedule.subject.name}`,
        message: `${schedule.dayOfWeek} · ${schedule.startTime}–${schedule.endTime}${schedule.room ? ` · ${schedule.room}` : ''}`,
        link: '/timetable',
      }),
    'schedule-update'
  )

  return toSchedule(schedule)
}

export async function deleteSchedule(id: string): Promise<void> {
  const existing = await prisma.classSchedule.findUnique({ where: { id } })
  if (!existing) throw new ScheduleNotFoundError()

  await prisma.classSchedule.delete({ where: { id } })
}
