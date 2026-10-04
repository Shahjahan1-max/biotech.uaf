export interface Subject {
  id: string
  name: string
  code: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface SubjectInput {
  name: string
  code: string
  description?: string
}
