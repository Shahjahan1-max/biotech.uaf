import { apiFetch } from './api'
import type { StudyResource } from '../types/resource'

export async function getResources(subjectId?: string): Promise<StudyResource[]> {
  const query = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : ''
  const data = await apiFetch<{ resources: StudyResource[] }>(`/resources${query}`)
  return data.resources
}

export type ResourceInput = Pick<StudyResource, 'title' | 'resourceType' | 'subjectId'> &
  Partial<Pick<StudyResource, 'description' | 'url' | 'fileName' | 'originalFileName' | 'filePath' | 'fileMimeType' | 'fileSize'>>

export async function createResource(input: ResourceInput): Promise<StudyResource> {
  const data = await apiFetch<{ resource: StudyResource }>('/resources', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.resource
}
