import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionHeader } from '../components/SectionHeader'
import { Button } from '../components/Button'
import { Spinner } from '../components/Spinner'
import { NotificationTypeBadge } from '../components/NotificationTypeBadge'
import { PushNotificationsToggle } from '../components/PushNotificationsToggle'
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  emitNotificationsChanged,
} from '../services/notifications'
import type { Notification, NotificationListResponse } from '../types/notification'

const EMPTY_PAGE: NotificationListResponse = {
  items: [],
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  unreadCount: 0,
}

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString()
}

export function Notifications() {
  const navigate = useNavigate()

  const [result, setResult] = useState<NotificationListResponse>(EMPTY_PAGE)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [pendingMarkId, setPendingMarkId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError('')

    listNotifications({ page, limit: 20, unreadOnly })
      .then((data) => {
        if (active) setResult(data)
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load notifications.')
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [page, unreadOnly, refreshKey])

  function refresh() {
    setRefreshKey((key) => key + 1)
  }

  function reportActionError(err: unknown, fallback: string) {
    setActionError(err instanceof Error ? err.message : fallback)
  }

  async function handleMarkRead(notification: Notification) {
    if (pendingMarkId) return
    setActionError('')
    const wasUnread = !notification.isRead
    setPendingMarkId(notification.id)
    try {
      if (wasUnread) {
        await markNotificationRead(notification.id)
        emitNotificationsChanged()
      }
      if (notification.link) navigate(notification.link)
      else if (wasUnread) refresh()
    } catch (err) {
      reportActionError(err, 'Failed to mark notification as read')
    } finally {
      setPendingMarkId(null)
    }
  }

  async function handleMarkAllRead() {
    if (isMarkingAll || unreadCount === 0) return
    setActionError('')
    setIsMarkingAll(true)
    try {
      await markAllNotificationsRead()
      emitNotificationsChanged()
      refresh()
    } catch (err) {
      reportActionError(err, 'Failed to mark all notifications as read')
    } finally {
      setIsMarkingAll(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this notification? This cannot be undone.')) return
    setActionError('')
    try {
      await deleteNotification(id)
      emitNotificationsChanged()
      if (result.items.length === 1 && page > 1) setPage((current) => current - 1)
      else refresh()
    } catch (err) {
      reportActionError(err, 'Failed to delete notification')
    }
  }

  const unreadCount = result.unreadCount
  const hasFilter = unreadOnly

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader
        as="h1"
        title="Notifications"
        subtitle="Updates about announcements, assignments, discussions, and class changes"
        action={
          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={isLoading || isMarkingAll || unreadCount === 0}
          >
            {isMarkingAll ? 'Marking...' : 'Mark all as read'}
          </Button>
        }
      />

      <PushNotificationsToggle />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setPage(1)
              setUnreadOnly(e.target.checked)
            }}
            className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
          />
          Unread only
        </label>
        {!isLoading && !error && (
          <span className="text-sm text-neutral-500">
            {unreadCount} unread · {result.total} total
          </span>
        )}
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError('')}
            className="font-medium text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner label="Loading notifications" />
          <p className="text-sm text-neutral-500">Loading notifications...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">Error Loading Notifications</h3>
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <Button variant="outline" onClick={refresh}>
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !error && result.items.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">
            {hasFilter ? 'No unread notifications.' : 'No notifications yet.'}
          </h3>
          <p className="text-sm text-neutral-500">
            {hasFilter
              ? 'You are all caught up.'
              : 'Updates about your classes will appear here.'}
          </p>
          {hasFilter && (
            <div className="mt-4">
              <Button variant="outline" onClick={() => setUnreadOnly(false)}>
                Show All Notifications
              </Button>
            </div>
          )}
        </div>
      )}

      {!isLoading && !error && result.items.length > 0 && (
        <>
          <div className="space-y-3">
            {result.items.map((notification) => {
              const isUnread = !notification.isRead
              const isPending = pendingMarkId === notification.id
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border shadow-sm transition-colors ${
                    isUnread
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {isUnread && (
                      <span
                        aria-label="Unread"
                        className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"
                      />
                    )}
                    <span
                      className={`text-sm ${
                        isUnread
                          ? 'font-semibold text-neutral-900'
                          : 'font-medium text-neutral-700'
                      }`}
                    >
                      {notification.title}
                    </span>
                    <NotificationTypeBadge type={notification.type} />
                    {isUnread && (
                      <span className="text-xs font-semibold text-emerald-700 uppercase">
                        Unread
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                    {notification.message}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <span className="text-xs text-neutral-500">
                      {formatTimestamp(notification.createdAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkRead(notification)}
                          disabled={isPending}
                        >
                          {isPending ? 'Marking...' : 'Mark as read'}
                        </Button>
                      )}
                      {notification.link && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkRead(notification)}
                          disabled={isPending}
                        >
                          Open
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(notification.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {(result.totalPages > 1 || result.page > 1) && (
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={result.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-neutral-500">
                Page {result.page} of {result.totalPages} · {result.total} notification
                {result.total === 1 ? '' : 's'}
              </span>
              <Button
                variant="outline"
                disabled={result.page >= result.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
