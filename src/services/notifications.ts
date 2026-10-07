import { apiFetch } from './api'
import type {
  NotificationListFilters,
  NotificationListResponse,
  UnreadCountResponse,
} from '../types/notification'

function buildQuery(filters: NotificationListFilters): string {
  const params = new URLSearchParams()

  if (filters.page !== undefined) params.set('page', String(filters.page))
  if (filters.limit !== undefined) params.set('limit', String(filters.limit))
  if (filters.unreadOnly) params.set('unreadOnly', 'true')

  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function listNotifications(
  filters: NotificationListFilters = {}
): Promise<NotificationListResponse> {
  return apiFetch<NotificationListResponse>(`/notifications${buildQuery(filters)}`)
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  return apiFetch<UnreadCountResponse>('/notifications/unread-count')
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiFetch(`/notifications/${id}/read`, { method: 'PUT' })
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch('/notifications/read-all', { method: 'PUT' })
}

export async function deleteNotification(id: string): Promise<void> {
  await apiFetch(`/notifications/${id}`, { method: 'DELETE' })
}

export const NOTIFICATIONS_CHANGED_EVENT = 'biotech:notifications-changed'

export function emitNotificationsChanged(): void {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT))
}
