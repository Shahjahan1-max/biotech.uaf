import { promises as fs } from 'fs'
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
  get(storedFileName: string): Promise<{ path: string; mimeType: string } | null>
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

function resolveUploadPath(uploadDir: string, storedFileName: string): string | null {
  if (!isValidStoredName(storedFileName)) return null

  const baseDir = path.resolve(uploadDir)
  const target = path.resolve(baseDir, path.basename(storedFileName))

  if (!target.startsWith(baseDir + path.sep)) return null
  return target
}

export function validateFile(file: Express.Multer.File): string | null {
  if (!file) return 'No file provided'

  const ext = path.extname(file.originalname).toLowerCase()
  const allowedExts = Object.values(ALLOWED_MIME_TYPES)

  if (!allowedExts.includes(ext)) {
    return 'Unsupported file type'
  }

  if (!ALLOWED_MIME_TYPES[file.mimetype]) {
    return 'Unsupported MIME type'
  }

  if (file.size > config.maxFileSize) {
    return 'File too large'
  }

  return null
}

export class LocalStorageService implements StorageService {
  private uploadDir: string
  private dirReady: Promise<void>

  constructor() {
    this.uploadDir = config.uploadDir
    this.dirReady = this.ensureUploadDir()
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir)
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true })
    }
  }

  async save(file: Express.Multer.File): Promise<StoredFile> {
    await this.dirReady

    const id = crypto.randomUUID()
    const ext = path.extname(file.originalname).toLowerCase()
    const storedFileName = `${id}${ext}`
    const filePath = path.join(this.uploadDir, storedFileName)

    await fs.writeFile(filePath, file.buffer)

    return {
      id,
      originalFileName: file.originalname,
      storedFileName,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
    }
  }

  async get(storedFileName: string): Promise<{ path: string; mimeType: string } | null> {
    const filePath = resolveUploadPath(this.uploadDir, storedFileName)
    if (!filePath) return null

    try {
      const stats = await fs.stat(filePath)
      if (!stats.isFile()) return null

      const ext = path.extname(filePath).toLowerCase()
      const mimeType =
        Object.entries(ALLOWED_MIME_TYPES).find(([, e]) => e === ext)?.[0] ||
        'application/octet-stream'
      return { path: filePath, mimeType }
    } catch {
      return null
    }
  }

  async delete(storedFileName: string): Promise<boolean> {
    const filePath = resolveUploadPath(this.uploadDir, storedFileName)
    if (!filePath) return false

    try {
      await fs.unlink(filePath)
      return true
    } catch {
      return false
    }
  }

  getUrl(storedFileName: string): string {
    return `/api/uploads/${storedFileName}`
  }
}

export const storageService = new LocalStorageService()
