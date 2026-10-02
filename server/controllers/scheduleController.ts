import type { Request, Response } from 'express'
import * as scheduleService from '../services/scheduleService'
import type { DayOfWeek, ScheduleInput } from '../types/schedule'

function optionalQuery(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function readInput(body: Partial<ScheduleInput>): ScheduleInput {
  return {
    dayOfWeek: body.dayOfWeek as DayOfWeek,
    startTime: body.startTime as string,
    endTime: body.endTime as string,
    instructor: body.instructor as string,
    room: body.room as string,
    subjectId: body.subjectId as string,
  }
}

function handleError(res: Response, error: unknown, fallback: string): void {
  if (error instanceof scheduleService.ScheduleNotFoundError) {
    res.status(404).json({ error: error.message })
    return
  }
  if (error instanceof scheduleService.ScheduleValidationError) {
    res.status(400).json({ error: error.message })
    return
  }
  res.status(500).json({ error: fallback })
}

export async function getSchedules(req: Request, res: Response) {
  try {
    const schedules = await scheduleService.getSchedules({
      day: optionalQuery(req.query.day),
      subjectId: optionalQuery(req.query.subjectId),
    })
    res.json({ schedules })
  } catch (error) {
    handleError(res, error, 'Failed to fetch schedule')
  }
}

export async function getSchedule(req: Request, res: Response) {
  try {
    const schedule = await scheduleService.getScheduleById(req.params.id)
    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' })
      return
    }
    res.json({ schedule })
  } catch (error) {
    handleError(res, error, 'Failed to fetch schedule')
  }
}

export async function createSchedule(req: Request, res: Response) {
  try {
    const schedule = await scheduleService.createSchedule(readInput(req.body ?? {}))
    res.status(201).json({ schedule })
  } catch (error) {
    handleError(res, error, 'Failed to create schedule')
  }
}

export async function updateSchedule(req: Request, res: Response) {
  try {
    const schedule = await scheduleService.updateSchedule(
      req.params.id,
      readInput(req.body ?? {})
    )
    res.json({ schedule })
  } catch (error) {
    handleError(res, error, 'Failed to update schedule')
  }
}

export async function deleteSchedule(req: Request, res: Response) {
  try {
    await scheduleService.deleteSchedule(req.params.id)
    res.json({ message: 'Schedule deleted successfully' })
  } catch (error) {
    handleError(res, error, 'Failed to delete schedule')
  }
}
