import { prisma } from '../utils/prisma.js'
import type { Assignment, AssignmentInput } from '../types/assignment.js'
import { excerpt, notifyStudents, safeNotify } from './notificationService.js'
import { deliverNotificationPush, safeBackgroundPushError } from './pushService.js'


const FOURTY_EIGHT_HOURS = 48 * 60 * 60 * 1000

function calculateStatus(dueDate: Date): 'UPCOMING' | 'DUE_SOON' | 'OVERDUE' {
  const now = new Date()
  const diff = dueDate.getTime() - now.getTime()

  if (diff < 0) return 'OVERDUE'
  if (diff < FOURTY_EIGHT_HOURS) return 'DUE_SOON'
  return 'UPCOMING'
}

function withComputedFields(assignment: {
  id: string
  title: string
  description: string | null
  dueDate: Date
  subjectId: string
  fileName: string | null
  filePath: string | null
  createdAt: Date
  updatedAt: Date
  subject?: Assignment['subject']
}): Assignment {
  return {
    ...assignment,
    dueTime: assignment.dueDate.toLocaleTimeString(),
    status: calculateStatus(assignment.dueDate),
  }
}

export async function getAssignments(subjectId?: string): Promise<Assignment[]> {
  const where = subjectId ? { subjectId } : {}
  const assignments = await prisma.assignment.findMany({
    where,
    include: { subject: true },
    orderBy: { dueDate: 'asc' },
  })
  return assignments.map(withComputedFields)
}

export async function getAssignment(id: string): Promise<Assignment | null> {
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { subject: true },
  })
  return assignment ? withComputedFields(assignment) : null
}

export async function createAssignment(input: AssignmentInput): Promise<Assignment> {
  const dueDate = new Date(input.dueDate)
  const assignment = await prisma.assignment.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      dueDate,
      subjectId: input.subjectId,
      fileName: input.fileName ?? null,
      filePath: input.filePath ?? null,
    },
    include: { subject: true },
  })

  const dueLabel = dueDate.toLocaleDateString()
  const createdNotifications = await safeNotify(
    () =>
      notifyStudents({
        type: 'ASSIGNMENT',
        title: `New assignment: ${assignment.title}`,
        message: excerpt(
          assignment.description
            ? `Assignment for ${assignment.subject.name} due ${dueLabel} — ${assignment.description}`
            : `New assignment for ${assignment.subject.name} — due ${dueLabel}`
        ),
        link: `/assignments/${assignment.id}`,
      }),
    'assignment-create'
  )

  if (createdNotifications && createdNotifications.length > 0) {
    void deliverNotificationPush(createdNotifications).catch((error: unknown) => {
      const detail = safeBackgroundPushError(error)
      if (detail) {
        console.error(`[Push] Background notification delivery failed: ${detail}`)
      } else {
        console.error('[Push] Background notification delivery failed')
      }
    })
  }

  return withComputedFields(assignment)
}

export async function updateAssignment(id: string, input: AssignmentInput): Promise<Assignment> {
  const dueDate = new Date(input.dueDate)
  const keepExistingFile =
    input.fileName === undefined && input.filePath === undefined
  const assignment = await prisma.assignment.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description ?? null,
      dueDate,
      subjectId: input.subjectId,
      ...(keepExistingFile
        ? {}
        : { fileName: input.fileName ?? null, filePath: input.filePath ?? null }),
    },
    include: { subject: true },
  })
  return withComputedFields(assignment)
}

export async function deleteAssignment(id: string): Promise<void> {
  await prisma.assignment.delete({ where: { id } })
}
