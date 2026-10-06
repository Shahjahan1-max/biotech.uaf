import { promises as fs, createReadStream } from 'fs'
import path from 'path'
import crypto from 'crypto'
import type { Readable } from 'stream'
import { config } from '../../config/env.js'
import { CloudinaryStorageService } from './cloudinary.js'
import {
  ALLOWED_MIME_TYPES,
  isValidStoredName,
  mimeTypeFromExt,
} from './common.js'

export interface StoredFile {
  id: string
  originalFileName: string
  storedFileName: string
  mimeType: string
  size: number
  path: string
}

export interface ReadableFile {
  mimeType: string
  stream: Readable
}

export interface StorageService {
  save(file: Express.Multer.File): Promise<StoredFile>
  get(storedFileName: string): Promise<{ path: string; mimeType: string } | null>
  openRead(storedFileName: string): Promise<ReadableFile | null>
  delete(storedFileName: string): Promise<boolean>
  getUrl(storedFileName: string): string
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
      const mimeType = mimeTypeFromExt(ext) || 'application/octet-stream'
      return { path: filePath, mimeType }
    } catch {
      return null
    }
  }

  async openRead(storedFileName: string): Promise<ReadableFile | null> {
    const file = await this.get(storedFileName)
    if (!file) return null

    return { mimeType: file.mimeType, stream: createReadStream(file.path) }
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

function isCloudConfigured(): boolean {
  const { cloudName, apiKey, apiSecret } = config.cloudinary
  const provided = [cloudName, apiKey, apiSecret].filter(Boolean).length

  if (provided > 0 && provided < 3) {
    throw new Error(
      'Cloud storage configuration is incomplete: set CLOUDINARY_URL (cloudinary://<api_key>:<api_secret>@<cloud_name>) or all of CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.'
    )
  }

  if (provided === 0 && config.nodeEnv === 'production') {
    console.warn(
      '[storage] CLOUDINARY_URL is not set: uploads use the local filesystem and will be lost on restart or redeploy.'
    )
  }

  return provided === 3
}

const localFallback = new LocalStorageService()

export const storageService: StorageService = isCloudConfigured()
  ? new CloudinaryStorageService(config.cloudinary, localFallback)
  : localFallback
