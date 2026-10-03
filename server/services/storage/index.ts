import { getStore } from '@netlify/blobs'
import path from 'path'
import crypto from 'crypto'
import { config } from '../../config/env.js'

export interface StoredFile {
  id: string
  originalFileName: string
  storedFileName: string
  mimeType: string
  size: number
  path: string
}

export interface StorageService {
  save(file: Express.Multer.File): Promise<StoredFile>
  get(storedFileName: string): Promise<{ data: ArrayBuffer; mimeType: string } | null>
  delete(storedFileName: string): Promise<boolean>
  getUrl(storedFileName: string): string
}

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/plain': '.txt',
  'image/png': '.png',
  'image/jpeg': '.jpg',
}

const STORED_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{1,10}$/i

function isValidStoredName(storedFileName: string): boolean {
  return STORED_NAME_PATTERN.test(storedFileName)
}

export function validateFile(file: Express.Multer.File): string | null {
  if (!file) return 'No file provided'

  const ext = path.extname(file.originalname).toLowerCase()
  const allowedExts = Object.values(ALLOWED_MIME_TYPES)

  if (!allowedExts.includes(ext) && ext !== '.jpeg') {
    return 'Unsupported file type'
  }

  const expectedExt = ALLOWED_MIME_TYPES[file.mimetype]
  if (!expectedExt || (ext !== expectedExt && !(expectedExt === '.jpg' && ext === '.jpeg'))) {
    return 'Unsupported MIME type'
  }

  if (file.size > config.maxFileSize) {
    return 'File too large'
  }

  return null
}

export class BlobStorageService implements StorageService {
  async save(file: Express.Multer.File): Promise<StoredFile> {
    const id = crypto.randomUUID()
    const ext = path.extname(file.originalname).toLowerCase()
    const storedFileName = `${id}${ext}`
    const filePath = this.getUrl(storedFileName)
    await getStore('portal-uploads').set(storedFileName, new Uint8Array(file.buffer).buffer)

    return {
      id,
      originalFileName: file.originalname,
      storedFileName,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
    }
  }

  async get(storedFileName: string): Promise<{ data: ArrayBuffer; mimeType: string } | null> {
    if (!isValidStoredName(storedFileName)) return null
    const data = await getStore('portal-uploads').get(storedFileName, { type: 'arrayBuffer' })
    if (!data) return null
    const ext = path.extname(storedFileName).toLowerCase()
    const mimeType = Object.entries(ALLOWED_MIME_TYPES).find(([, extension]) => extension === ext || (ext === '.jpeg' && extension === '.jpg'))?.[0] || 'application/octet-stream'
    return { data, mimeType }
  }

  async delete(storedFileName: string): Promise<boolean> {
    if (!isValidStoredName(storedFileName)) return false
    const store = getStore('portal-uploads')
    if (!(await store.getMetadata(storedFileName))) return false
    await store.delete(storedFileName)
    return true
  }

  getUrl(storedFileName: string): string {
    return `/api/uploads/${storedFileName}`
  }
}

export const storageService = new BlobStorageService()
