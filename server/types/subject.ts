export interface SubjectInput {
  name: string
  code: string
  description?: string
}

export interface Subject {
  id: string
  name: string
  code: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}
