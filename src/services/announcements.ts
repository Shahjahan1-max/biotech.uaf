import { apiFetch } from './api'
import type {
  Announcement,
  AnnouncementInput,
  AnnouncementListFilters,
  PaginatedAnnouncements,
} from '../types/announcement'

function buildQuery(filters: AnnouncementListFilters): string {
  const params = new URLSearchParams()

  if (filters.subjectId) params.set('subjectId', filters.subjectId)
  if (filters.type) params.set('type', filters.type)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.search) params.set('search', filters.search)
  if (filters.includeExpired !== undefined) {
    params.set('includeExpired', String(filters.includeExpired))
  }
  if (filters.page !== undefined) params.set('page', String(filters.page))
  if (filters.limit !== undefined) params.set('limit', String(filters.limit))

  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function listAnnouncements(
  filters: AnnouncementListFilters = {}
): Promise<PaginatedAnnouncements> {
  return apiFetch<PaginatedAnnouncements>(`/announcements${buildQuery(filters)}`)
}

export async function getAnnouncement(id: string): Promise<Announcement> {
  const data = await apiFetch<{ announcement: Announcement }>(`/announcements/${id}`)
  return data.announcement
}

export async function createAnnouncement(input: AnnouncementInput): Promise<Announcement> {
  const data = await apiFetch<{ announcement: Announcement }>('/announcements', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.announcement
}

export async function updateAnnouncement(
  id: string,
  input: AnnouncementInput
): Promise<Announcement> {
  const data = await apiFetch<{ announcement: Announcement }>(`/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return data.announcement
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await apiFetch(`/announcements/${id}`, { method: 'DELETE' })
}
