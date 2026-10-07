import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../utils/cn'
import { useAuth } from '../hooks/useAuth'
import {
  getUnreadCount,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  NOTIFICATIONS_CHANGED_EVENT,
} from '../services/notifications'
import { NotificationTypeBadge } from './NotificationTypeBadge'
import type { Notification } from '../types/notification'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Subjects', href: '/subjects' },
  { label: 'Notes', href: '/resources' },
  { label: 'Assignments', href: '/assignments' },
  { label: 'Timetable', href: '/timetable' },
  { label: 'Discussions', href: '/discussions' },
  { label: 'Announcements', href: '/announcements' },
]

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  )
}

function currentTimestamp(): string {
  return new Date().toISOString()
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [preview, setPreview] = useState<Notification[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const [markingAll, setMarkingAll] = useState(false)
  const bellRef = useRef<HTMLDivElement | null>(null)
  const mobileMenuRef = useRef<HTMLElement | null>(null)
  const menuToggleRef = useRef<HTMLButtonElement | null>(null)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isAdmin = user?.role === 'ADMIN'
  const visibleNavItems = isAdmin
    ? [...navItems, { label: 'Admin', href: '/admin' }]
    : navItems

  function isActive(href: string): boolean {
    if (href === '/') return location.pathname === '/'
    return location.pathname === href || location.pathname.startsWith(`${href}/`)
  }

  useEffect(() => {
    if (!isAuthenticated) return

    let active = true

    function refreshUnreadCount() {
      getUnreadCount()
        .then((data) => {
          if (active) setUnreadCount(data.count)
        })
        .catch(() => {})
    }

    refreshUnreadCount()
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refreshUnreadCount)

    return () => {
      active = false
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refreshUnreadCount)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!bellOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [bellOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return

    function closeMenu() {
      setMobileMenuOpen(false)
    }

    function handleMenuOutside(event: MouseEvent) {
      const target = event.target as Node
      if (mobileMenuRef.current?.contains(target)) return
      if (menuToggleRef.current?.contains(target)) return
      closeMenu()
    }

    document.addEventListener('mousedown', handleMenuOutside)
    window.addEventListener('popstate', closeMenu)
    return () => {
      document.removeEventListener('mousedown', handleMenuOutside)
      window.removeEventListener('popstate', closeMenu)
    }
  }, [mobileMenuOpen])

  async function handleBellToggle() {
    if (bellOpen) {
      setBellOpen(false)
      return
    }

    setBellOpen(true)
    setPreviewError('')
    setPreviewLoading(true)
    try {
      const data = await listNotifications({ limit: 5 })
      setPreview(data.items)
      setUnreadCount(data.unreadCount)
    } catch {
      setPreview([])
      setPreviewError('Unable to load notifications.')
    } finally {
      setPreviewLoading(false)
    }
  }

  async function handlePreviewSelect(notification: Notification) {
    if (!notification.isRead) {
      setPreviewError('')
      try {
        await markNotificationRead(notification.id)
      } catch {
        setPreviewError('Unable to mark notification as read.')
        return
      }
      const markedAt = currentTimestamp()
      setPreview((items) =>
        items.map((item) =>
          item.id === notification.id ? { ...item, isRead: true, readAt: markedAt } : item
        )
      )
      setUnreadCount((count) => Math.max(0, count - 1))
    }
    setBellOpen(false)
    navigate(notification.link ?? '/notifications')
  }

  async function handlePreviewMarkAll() {
    if (markingAll || unreadCount === 0) return
    setMarkingAll(true)
    setPreviewError('')
    try {
      await markAllNotificationsRead()
    } catch {
      setPreviewError('Unable to mark all as read.')
      return
    } finally {
      setMarkingAll(false)
    }
    const markedAt = currentTimestamp()
    setPreview((items) =>
      items.map((item) => (item.isRead ? item : { ...item, isRead: true, readAt: markedAt }))
    )
    setUnreadCount(0)
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="glass sticky top-0 z-50 border-b border-border-subtle/80 shadow-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-emerald-500/60 via-teal-400/50 to-cyan-400/50"
          />

          <Link to="/" className="group/logo flex items-center gap-3">
            <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-sm shadow-emerald-600/30 ring-1 ring-inset ring-white/40 transition-shadow duration-200 group-hover/logo:shadow-glow">
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path strokeLinecap="round" d="M7.5 3.5c0 4.5 9 4.5 9 8.5s-9 4-9 8.5" />
                <path strokeLinecap="round" d="M16.5 3.5c0 4.5-9 4.5-9 8.5s9 4 9 8.5" />
                <path strokeLinecap="round" d="M9.5 7.5h5M9.5 12h5M9.5 16.5h5" />
                <circle cx="7.5" cy="3.5" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="16.5" cy="3.5" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="7.5" cy="20.5" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="16.5" cy="20.5" r="1.4" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <div className="hidden sm:block">
              <span
                className="text-base font-semibold tracking-tight text-transparent bg-clip-text"
                style={{ backgroundImage: 'var(--gradient-brand)' }}
              >
                Biotechnology
              </span>
              <span className="text-base font-medium text-teal-700 ml-1.5">
                — Section A
              </span>
            </div>
          </Link>

          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
            {visibleNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'relative px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                  isActive(item.href)
                    ? 'text-emerald-700 bg-surface-tint ring-1 ring-inset ring-emerald-600/20 shadow-sm shadow-emerald-600/10'
                    : 'text-ink-muted hover:text-ink-strong hover:bg-surface-tint/70'
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2.5 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 animate-indicator"
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="relative" ref={bellRef}>
                  <button
                    type="button"
                    onClick={handleBellToggle}
                    aria-haspopup="true"
                    aria-expanded={bellOpen}
                    aria-controls="notification-preview"
                    aria-label={
                      unreadCount > 0
                        ? `Notifications, ${unreadCount} unread`
                        : 'Notifications'
                    }
                    className={cn(
                      'relative p-2.5 rounded-xl ring-1 ring-inset transition-all duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                      bellOpen
                        ? 'bg-surface-tint text-emerald-700 ring-emerald-600/25 shadow-sm'
                        : 'text-ink-muted ring-transparent hover:text-emerald-700 hover:bg-surface-tint/70 hover:ring-emerald-600/15'
                    )}
                  >
                    <BellIcon className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[11px] font-semibold flex items-center justify-center ring-2 ring-white shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {bellOpen && (
                    <div id="notification-preview" className="absolute right-0 mt-2 w-80 bg-surface/95 backdrop-blur-md border border-border-subtle rounded-card shadow-panel z-50 overflow-hidden animate-reveal">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface-soft/60">
                        <span className="text-sm font-semibold text-ink-strong">
                          Notifications
                        </span>
                        <div className="flex items-center gap-3">
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={handlePreviewMarkAll}
                              disabled={markingAll}
                              className="text-xs font-medium text-ink-muted hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            >
                              {markingAll ? 'Marking...' : 'Mark all'}
                            </button>
                          )}
                          <Link
                            to="/notifications"
                            onClick={() => setBellOpen(false)}
                            className="text-xs font-medium text-emerald-700 hover:text-emerald-800 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                          >
                            View all
                          </Link>
                        </div>
                      </div>

                      {previewLoading && (
                        <div className="px-4 py-6 text-center text-sm text-ink-muted">
                          Loading...
                        </div>
                      )}

                      {!previewLoading && previewError && preview.length === 0 && (
                        <div className="px-4 py-6 text-center text-sm text-red-600">
                          {previewError}
                        </div>
                      )}

                      {!previewLoading && !previewError && preview.length === 0 && (
                        <div className="px-4 py-6 text-center text-sm text-ink-muted">
                          No notifications yet.
                        </div>
                      )}

                      {!previewLoading && preview.length > 0 && (
                        <>
                          {previewError && (
                            <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-b border-border-subtle">
                              {previewError}
                            </div>
                          )}
                          <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle">
                            {preview.map((notification) => {
                              const isUnread = !notification.isRead
                              return (
                                <button
                                  key={notification.id}
                                  type="button"
                                  onClick={() => handlePreviewSelect(notification)}
                                  className={cn(
                                    'w-full text-left px-4 py-3 transition-colors duration-150',
                                    isUnread ? 'bg-surface-tint/60 hover:bg-surface-tint' : 'hover:bg-surface-soft'
                                  )}
                                >
                                  <div className="flex items-start gap-2.5">
                                    <span
                                      aria-hidden="true"
                                      className={cn(
                                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control ring-1 ring-inset',
                                        isUnread
                                          ? 'bg-emerald-50 text-emerald-600 ring-emerald-600/15'
                                          : 'bg-surface-soft text-ink-muted ring-border-subtle'
                                      )}
                                    >
                                      <BellIcon className="w-4 h-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        {isUnread && (
                                          <span
                                            aria-label="Unread"
                                            className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"
                                          />
                                        )}
                                        <p
                                          className={cn(
                                            'text-sm text-ink-strong truncate min-w-0',
                                            isUnread ? 'font-semibold' : 'font-medium'
                                          )}
                                        >
                                          {notification.title}
                                        </p>
                                      </div>
                                      <p className="text-xs text-ink truncate">
                                        {notification.message}
                                      </p>
                                      <div className="flex items-center gap-1.5 mt-1 min-w-0">
                                        <NotificationTypeBadge type={notification.type} />
                                        <p className="text-xs text-ink-muted truncate">
                                          {new Date(notification.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                          </>
                        )}

                      <div className="border-t border-border-subtle px-4 py-3">
                        <Link
                          to="/notifications"
                          onClick={() => setBellOpen(false)}
                          className="block text-center text-sm font-medium text-emerald-700 hover:text-emerald-800 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2.5 group/user">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center ring-1 ring-inset ring-white/60 shadow-sm shadow-teal-600/30 transition-shadow duration-200 group-hover/user:shadow-glow">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold tracking-tight text-ink-strong">{user?.name}</p>
                    <p className="text-xs text-ink-muted">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-medium text-ink-muted hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-ink-strong hover:text-emerald-700 hover:bg-surface-tint rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm shadow-emerald-600/30 ring-1 ring-inset ring-white/20 hover:shadow-md hover:-translate-y-px active:translate-y-0 transition-all duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  style={{ backgroundImage: 'var(--gradient-brand)' }}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            {isAuthenticated && (
              <Link
                to="/notifications"
                aria-label={
                  unreadCount > 0
                    ? `Notifications, ${unreadCount} unread`
                    : 'Notifications'
                }
                className="relative p-2.5 rounded-xl text-ink-muted hover:text-emerald-700 hover:bg-surface-tint/70 ring-1 ring-inset ring-transparent hover:ring-emerald-600/15 transition-all duration-150"
              >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[11px] font-semibold flex items-center justify-center ring-2 ring-white shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              type="button"
              ref={menuToggleRef}
              className="p-3 rounded-xl text-ink-muted hover:text-ink-strong hover:bg-surface-tint ring-1 ring-inset ring-transparent hover:ring-border-strong transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <nav
        id="mobile-menu"
        ref={mobileMenuRef}
        aria-label="Mobile navigation"
        onClick={(event) => {
          const target = event.target as HTMLElement
          if (target.closest('a, button')) setMobileMenuOpen(false)
        }}
        className={cn(
          'lg:hidden absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto shadow-panel',
          mobileMenuOpen ? 'block' : 'hidden'
        )}
      >
        <div className="px-4 pt-3 pb-5 space-y-1.5 border-t border-border-subtle/80 bg-surface/95 backdrop-blur-md">
          {visibleNavItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                'block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
                isActive(item.href)
                  ? 'text-emerald-700 bg-surface-tint ring-1 ring-inset ring-emerald-600/20'
                  : 'text-ink hover:text-ink-strong hover:bg-surface-tint'
              )}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/notifications"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:text-ink-strong hover:bg-surface-tint transition-colors duration-150"
            >
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-600 text-white text-[11px] font-semibold flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )}
          <div className="pt-3 border-t border-border-subtle">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-ink-muted hover:text-red-700 hover:bg-red-50 transition-colors duration-150"
              >
                Logout ({user?.name})
              </button>
            ) : (
              <div className="space-y-2 px-3">
                <Link
                  to="/login"
                  className="block text-center px-4 py-2.5 text-sm font-medium text-ink-strong border border-border-strong rounded-xl hover:border-emerald-600 hover:bg-surface-tint transition-colors duration-150"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block text-center px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm shadow-emerald-600/30 ring-1 ring-inset ring-white/20 transition-all duration-150 hover:shadow-md"
                  style={{ backgroundImage: 'var(--gradient-brand)' }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
