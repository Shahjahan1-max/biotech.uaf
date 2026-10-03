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

export type SubjectInput = Pick<Subject, 'name' | 'code' | 'description'>

export async function saveSubject(input: SubjectInput, id?: string): Promise<Subject> {
  const data = await apiFetch<{ subject: Subject }>(id ? `/subjects/${encodeURIComponent(id)}` : '/subjects', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(input),
  })
  return data.subject
}

export async function deleteSubject(id: string): Promise<void> {
  await apiFetch(`/subjects/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
