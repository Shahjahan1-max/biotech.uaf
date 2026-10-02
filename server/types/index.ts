export interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface Subject {
  id: string
  name: string
  code: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}
