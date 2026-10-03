import { apiFetch, API_BASE_URL } from './api'

export interface UploadedFile {
  id: string
  originalFileName: string
  storedFileName: string
  mimeType: string
  size: number
  url: string
}

export async function uploadFile(file: File): Promise<UploadedFile> {
  const formData = new FormData()
  formData.append('file', file)

  return apiFetch<UploadedFile>('/uploads', {
    method: 'POST',
    body: formData,
  })
}

export function resolveUploadUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.replace(/\\/g, '/')
  if (normalized.startsWith('/api/')) return `${API_BASE_URL}${normalized.slice(4)}`
  const name = normalized.split('/').filter(Boolean).pop() ?? normalized
  return `${API_BASE_URL}/uploads/${encodeURIComponent(name)}`
}

export async function fetchFileUrl(filename: string): Promise<string> {
  const response = await fetch(
    resolveUploadUrl(filename),
    { credentials: 'include' }
  )

  if (!response.ok) {
    throw new Error(`Could not load file (${response.status})`)
  }

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export async function deleteUpload(filename: string): Promise<void> {
  await apiFetch(`/uploads/${encodeURIComponent(filename)}`, { method: 'DELETE' })
}
