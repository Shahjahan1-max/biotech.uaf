import { records as portal } from '../../db/repository.js'
import type { Assignment, AssignmentInput } from '../types/assignment.js'
import { excerpt, notifyStudents, safeNotify } from './notificationService.js'


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
  const assignments = await portal.assignment.findMany({
    where,
    include: { subject: true },
    orderBy: { dueDate: 'asc' },
  })
  return assignments.map(withComputedFields)
}

export async function getAssignment(id: string): Promise<Assignment | null> {
  const assignment = await portal.assignment.findUnique({
    where: { id },
    include: { subject: true },
  })
  return assignment ? withComputedFields(assignment) : null
}

export async function createAssignment(input: AssignmentInput): Promise<Assignment> {
  const dueDate = new Date(input.dueDate)
  const assignment = await portal.assignment.create({
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

  await safeNotify(
    () =>
      notifyStudents({
        type: 'ASSIGNMENT',
        title: assignment.title,
        message:
          excerpt(assignment.description ?? '') ||
          `Due ${assignment.subject.name} · ${dueDate.toLocaleDateString()}`,
        link: `/assignments/${assignment.id}`,
      }),
    'assignment-create'
  )

  return withComputedFields(assignment)
}

export async function updateAssignment(id: string, input: AssignmentInput): Promise<Assignment> {
  const dueDate = new Date(input.dueDate)
  const keepExistingFile =
    input.fileName === undefined && input.filePath === undefined
  const assignment = await portal.assignment.update({
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
  await portal.assignment.delete({ where: { id } })
}
