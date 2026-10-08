self.addEventListener('push', (event) => {
  let payload = {}

  if (event.data) {
    try {
      const parsed = event.data.json()
      if (parsed && typeof parsed === 'object') payload = parsed
    } catch {
      try {
        payload = { body: event.data.text() }
      } catch {
        // keep defaults
      }
    }
  }

  const title =
    typeof payload.title === 'string' && payload.title
      ? payload.title
      : 'Biotech Section A'
  const body =
    typeof payload.body === 'string' && payload.body
      ? payload.body
      : 'You have a new notification'

  const options = {
    body: body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: {
      notificationId:
        typeof payload.notificationId === 'string' ? payload.notificationId : '',
      url: typeof payload.url === 'string' ? payload.url : '',
      type: typeof payload.type === 'string' ? payload.type : '',
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const rawData = event.notification.data || {}
  let url = typeof rawData.url === 'string' ? rawData.url : ''
  if (!url.startsWith('/')) url = '/'

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      for (const client of clientList) {
        if ('focus' in client) {
          await client.focus()
          if ('navigate' in client && typeof client.navigate === 'function') {
            try {
              await client.navigate(url)
            } catch {
              // focus alone is acceptable if navigation is blocked
            }
          }
          return
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(url)
      }
    })()
  )
})
