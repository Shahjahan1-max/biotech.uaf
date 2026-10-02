import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../utils/cn'
import { useAuth } from '../hooks/useAuth'
import { getUnreadCount, listNotifications } from '../services/notifications'
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

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [preview, setPreview] = useState<Notification[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const bellRef = useRef<HTMLDivElement | null>(null)
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
    getUnreadCount()
      .then((data) => {
        if (active) setUnreadCount(data.count)
      })
      .catch(() => {})

    return () => {
      active = false
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

  function handlePreviewSelect(notification: Notification) {
    setBellOpen(false)
    navigate(notification.link ?? '/notifications')
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-semibold text-neutral-900">
                Biotechnology
              </span>
              <span className="text-base font-normal text-emerald-600 ml-1.5">
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
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                  isActive(item.href)
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                )}
              >
                {item.label}
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
                      'relative p-2 rounded-lg transition-colors',
                      bellOpen
                        ? 'bg-neutral-100 text-neutral-900'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    )}
                  >
                    <BellIcon className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {bellOpen && (
                    <div id="notification-preview" className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100">
                        <span className="text-sm font-semibold text-neutral-900">
                          Notifications
                        </span>
                        <Link
                          to="/notifications"
                          onClick={() => setBellOpen(false)}
                          className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          View all
                        </Link>
                      </div>

                      {previewLoading && (
                        <div className="px-4 py-6 text-center text-sm text-neutral-500">
                          Loading...
                        </div>
                      )}

                      {!previewLoading && previewError && (
                        <div className="px-4 py-6 text-center text-sm text-red-600">
                          {previewError}
                        </div>
                      )}

                      {!previewLoading && !previewError && preview.length === 0 && (
                        <div className="px-4 py-6 text-center text-sm text-neutral-500">
                          No notifications yet.
                        </div>
                      )}

                      {!previewLoading && !previewError && preview.length > 0 && (
                        <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                          {preview.map((notification) => {
                            const isUnread = notification.readAt === null
                            return (
                              <button
                                key={notification.id}
                                type="button"
                                onClick={() => handlePreviewSelect(notification)}
                                className={cn(
                                  'w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors',
                                  isUnread && 'bg-emerald-50/50'
                                )}
                              >
                                <div className="flex items-start gap-2">
                                  {isUnread && (
                                    <span
                                      aria-label="Unread"
                                      className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <p
                                      className={cn(
                                        'text-sm text-neutral-900 truncate',
                                        isUnread ? 'font-semibold' : 'font-medium'
                                      )}
                                    >
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-neutral-500 truncate">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-0.5">
                                      {new Date(notification.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      <div className="border-t border-neutral-100 px-4 py-2.5">
                        <Link
                          to="/notifications"
                          onClick={() => setBellOpen(false)}
                          className="block text-center text-sm font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-700 font-medium text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-neutral-900">{user?.name}</p>
                    <p className="text-xs text-neutral-500">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
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
                className="relative p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              type="button"
              className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
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
        aria-label="Mobile navigation"
        className={cn('lg:hidden', mobileMenuOpen ? 'block' : 'hidden')}
      >
        <div className="px-4 pt-2 pb-4 space-y-1 border-t border-neutral-200 bg-white">
          {visibleNavItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/notifications"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            >
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )}
          <div className="pt-3 border-t border-neutral-200">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              >
                Logout ({user?.name})
              </button>
            ) : (
              <div className="space-y-2 px-3">
                <Link
                  to="/login"
                  className="block text-center px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block text-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
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
