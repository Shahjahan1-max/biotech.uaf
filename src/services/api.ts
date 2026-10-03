export const API_BASE_URL = '/api'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers)

  if (!(options?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = `API error: ${response.status}`
    try {
      const data = await response.json()
      if (data && typeof data.error === 'string') message = data.error
    } catch {
      // keep the status based message
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T

  return response.json()
}
