import { apiFetch } from './api'
import type { Subject } from '../types/subject'

export async function getSubjects(): Promise<Subject[]> {
  const data = await apiFetch<{ subjects: Subject[] }>('/subjects')
  return data.subjects
}

export async function getSubject(id: string): Promise<Subject> {
  const data = await apiFetch<{ subject: Subject }>(`/subjects/${id}`)
  return data.subject
}
