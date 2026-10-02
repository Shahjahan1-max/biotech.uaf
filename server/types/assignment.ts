import type { Subject } from './subject'

export type AssignmentStatus = 'UPCOMING' | 'DUE_SOON' | 'OVERDUE'

export interface AssignmentInput {
  title: string
  description?: string | null
  dueDate: Date
  subjectId: string
  fileName?: string | null
  filePath?: string | null
}

export interface Assignment {
  id: string
  title: string
  description: string | null
  dueDate: Date
  dueTime: string
  status: AssignmentStatus
  subjectId: string
  subject?: Subject
  fileName: string | null
  filePath: string | null
  createdAt: Date
  updatedAt: Date
}
