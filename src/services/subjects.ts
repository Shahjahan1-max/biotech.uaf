import { apiFetch } from './api'
import type { Subject, SubjectInput } from '../types/subject'

export async function getSubjects(): Promise<Subject[]> {
  const data = await apiFetch<{ subjects: Subject[] }>('/subjects')
  return data.subjects
}

export async function getSubject(id: string): Promise<Subject> {
  const data = await apiFetch<{ subject: Subject }>(`/subjects/${id}`)
  return data.subject
}

export async function createSubject(input: SubjectInput): Promise<Subject> {
  const data = await apiFetch<{ subject: Subject }>('/subjects', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.subject
}

export async function updateSubject(id: string, input: SubjectInput): Promise<Subject> {
  const data = await apiFetch<{ subject: Subject }>(`/subjects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return data.subject
}
