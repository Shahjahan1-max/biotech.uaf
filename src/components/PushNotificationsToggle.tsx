import { useEffect, useState } from 'react'
import { Button } from './Button'
import { Spinner } from './Spinner'
import {
  getPushState,
  enablePush,
  disablePush,
  type PushState,
} from '../services/push'

export function PushNotificationsToggle() {
  const [state, setState] = useState<PushState | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getPushState()
      .then((result) => {
        if (active) setState(result)
      })
      .catch(() => {
        if (active) setState({ supported: false, permission: 'unsupported', subscribed: false })
      })
    return () => {
      active = false
    }
  }, [])

  async function handleEnable() {
    if (isBusy) return
    setError('')
    setIsBusy(true)
    try {
      await enablePush()
      setState(await getPushState())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable push notifications.')
      setState(await getPushState().catch(() => null))
    } finally {
      setIsBusy(false)
    }
  }

  async function handleDisable() {
    if (isBusy) return
    setError('')
    setIsBusy(true)
    try {
      await disablePush()
      setState(await getPushState())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable push notifications.')
      setState(await getPushState().catch(() => null))
    } finally {
      setIsBusy(false)
    }
  }

  const isSupported = state?.supported ?? false
  const isDenied = state?.permission === 'denied'
  const isEnabled = state?.subscribed ?? false

  let statusText = 'Checking...'
  if (state && !isSupported) statusText = 'Not supported by this browser'
  else if (state && isDenied) statusText = 'Blocked in your browser settings'
  else if (isEnabled) statusText = 'Push notifications are on'
  else if (state) statusText = 'Push notifications are off'

  return (
    <div className="mb-6 p-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-neutral-900">Push notifications</h3>
            <p className="text-sm text-neutral-500">
              Get notified on this device even when the site is not open.
            </p>
            <p className="mt-1 text-xs font-medium text-neutral-600">{statusText}</p>
          </div>
        </div>

        <div className="flex-shrink-0">
          {!state && (
            <div className="inline-flex items-center gap-2 text-sm text-neutral-500">
              <Spinner size="sm" label="Checking push notifications" />
              Checking...
            </div>
          )}

          {state && !isSupported && (
            <span className="text-sm text-neutral-400">
              Unavailable — browser does not support Web Push
            </span>
          )}

          {state && isSupported && isDenied && (
            <span className="text-sm text-amber-600">
              Permission denied — enable it in your browser settings
            </span>
          )}

          {state && isSupported && !isDenied && isEnabled && (
            <Button variant="outline" size="sm" onClick={handleDisable} disabled={isBusy}>
              {isBusy ? 'Disabling...' : 'Disable'}
            </Button>
          )}

          {state && isSupported && !isDenied && !isEnabled && (
            <Button variant="primary" size="sm" onClick={handleEnable} disabled={isBusy}>
              {isBusy ? 'Enabling...' : 'Enable notifications'}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
