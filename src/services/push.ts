import { apiFetch } from './api'

export interface PushState {
  supported: boolean
  permission: NotificationPermission | 'unsupported'
  subscribed: boolean
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i)
  }
  return output
}

export async function getPushState(): Promise<PushState> {
  if (!isPushSupported()) {
    return { supported: false, permission: 'unsupported', subscribed: false }
  }

  const permission = Notification.permission
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = registration
    ? await registration.pushManager.getSubscription()
    : null

  return {
    supported: true,
    permission,
    subscribed: Boolean(subscription),
  }
}

export async function enablePush(): Promise<void> {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported by this browser.')
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.')
  }

  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  const { publicKey } = await apiFetch<{ publicKey: string }>('/push/public-key')

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    })
  }

  const json = subscription.toJSON()
  try {
    await apiFetch('/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      }),
    })
  } catch (error) {
    await subscription.unsubscribe().catch(() => false)
    throw error
  }
}

export async function disablePush(): Promise<void> {
  if (!isPushSupported()) return

  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = registration
    ? await registration.pushManager.getSubscription()
    : null

  if (subscription) {
    const endpoint = subscription.endpoint
    try {
      await apiFetch('/push/unsubscribe', {
        method: 'DELETE',
        body: JSON.stringify({ endpoint }),
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('API error: 401')) {
        await subscription.unsubscribe().catch(() => false)
        return
      }
      throw error
    }
    await subscription.unsubscribe().catch(() => false)
  }
}
