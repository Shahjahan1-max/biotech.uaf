export type AssignmentStatus = 'UPCOMING' | 'DUE_SOON' | 'OVERDUE'

export interface Assignment {
  id: string
  title: string
  description: string | null
  dueDate: string
  dueTime: string
  status: AssignmentStatus
  subjectId: string
  subject?: {
    id: string
    name: string
    code: string
  }
  filePath: string | null
  fileName: string | null
}

export interface AssignmentInput {
  title: string
  description?: string
  dueDate: string
  subjectId: string
  fileName?: string | null
  filePath?: string | null
}
