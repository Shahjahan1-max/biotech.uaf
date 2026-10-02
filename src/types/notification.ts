export type NotificationType =
  | 'ANNOUNCEMENT'
  | 'ASSIGNMENT'
  | 'DISCUSSION_REPLY'
  | 'RESOURCE'
  | 'SCHEDULE'
  | 'SYSTEM'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  link: string | null
  readAt: string | null
  createdAt: string
}

export interface NotificationListFilters {
  page?: number
  limit?: number
  unreadOnly?: boolean
}

export interface NotificationListResponse {
  items: Notification[]
  page: number
  limit: number
  total: number
  totalPages: number
  unreadCount: number
}

export interface UnreadCountResponse {
  count: number
}
