import { apiFetch } from './api'
import type { StudyResource } from '../types/resource'

export async function getResources(subjectId?: string): Promise<StudyResource[]> {
  const query = subjectId ? `?subjectId=${subjectId}` : ''
  const data = await apiFetch<{ resources: StudyResource[] }>(`/resources${query}`)
  return data.resources
}
