import crypto from 'crypto'
import path from 'path'
import { Readable } from 'stream'
import type { StorageService, StoredFile } from './index.js'
import {
  isValidStoredName,
  mimeTypeFromExt,
  resourceTypeForExt,
} from './common.js'

export interface CloudinaryConfig {
  cloudName: string
  apiKey: string
  apiSecret: string
  folder: string
  apiBase: string
  deliveryBase: string
}

interface ResolvedFile {
  publicId: string
  resourceType: 'image' | 'raw'
  ext: string
  mimeType: string
  deliveryUrl: string
}

export class CloudinaryStorageService implements StorageService {
  private cfg: CloudinaryConfig
  private fallback: StorageService

  constructor(cfg: CloudinaryConfig, fallback: StorageService) {
    if (!cfg.cloudName || !cfg.apiKey || !cfg.apiSecret) {
      throw new Error('Cloud storage configuration is incomplete.')
    }
    if (cfg.folder && !/^[A-Za-z0-9_\-/]+$/.test(cfg.folder)) {
      throw new Error(
        'CLOUDINARY_FOLDER may only contain letters, numbers, hyphens, underscores, and slashes.'
      )
    }
    this.cfg = cfg
    this.fallback = fallback
  }

  private authHeader(): string {
    return `Basic ${Buffer.from(`${this.cfg.apiKey}:${this.cfg.apiSecret}`).toString('base64')}`
  }

  private prefix(): string {
    return this.cfg.folder ? `${this.cfg.folder}/` : ''
  }

  private resolve(storedFileName: string): ResolvedFile | null {
    if (!isValidStoredName(storedFileName)) return null

    const ext = path.extname(storedFileName).toLowerCase()
    const resourceType = resourceTypeForExt(ext)
    const mimeType = mimeTypeFromExt(ext) || 'application/octet-stream'

    // Images store public_id without extension (format is forced at upload);
    // raw files keep the extension in public_id.
    const base =
      resourceType === 'image' ? storedFileName.slice(0, -ext.length) : storedFileName
    const publicId = `${this.prefix()}${base}`
    const baseurl = `${this.cfg.deliveryBase}/${this.cfg.cloudName}/${resourceType}/upload/${publicId}`
    const deliveryUrl = resourceType === 'image' ? `${baseurl}${ext}` : baseurl

    return { publicId, resourceType, ext, mimeType, deliveryUrl }
  }

  async save(file: Express.Multer.File): Promise<StoredFile> {
    const id = crypto.randomUUID()
    const ext = path.extname(file.originalname).toLowerCase()
    const storedFileName = `${id}${ext}`
    const resourceType = resourceTypeForExt(ext)

    const publicId =
      resourceType === 'image'
        ? `${this.prefix()}${id}`
        : `${this.prefix()}${storedFileName}`

    const form = new FormData()
    form.append(
      'file',
      new Blob([file.buffer as unknown as BlobPart], { type: file.mimetype }),
      path.basename(file.originalname)
    )
    form.append('public_id', publicId)
    if (resourceType === 'image') {
      form.append('format', ext.slice(1))
    }

    const response = await fetch(
      `${this.cfg.apiBase}/v1_1/${this.cfg.cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        headers: { Authorization: this.authHeader() },
        body: form,
      }
    )

    if (!response.ok) {
      throw new Error(`Cloud storage upload failed (HTTP ${response.status})`)
    }

    const data = (await response.json().catch(() => ({}))) as {
      public_id?: string
    }
    if (data.public_id && data.public_id !== publicId) {
      throw new Error('Cloud storage stored an unexpected file name')
    }

    return {
      id,
      originalFileName: file.originalname,
      storedFileName,
      mimeType: file.mimetype,
      size: file.size,
      path: `cloudinary://${this.cfg.cloudName}/${publicId}`,
    }
  }

  async get(storedFileName: string): Promise<{ path: string; mimeType: string } | null> {
    const target = this.resolve(storedFileName)
    if (target) {
      try {
        const head = await fetch(target.deliveryUrl, { method: 'HEAD' })
        if (head.ok) {
          return {
            path: `cloudinary://${this.cfg.cloudName}/${target.publicId}`,
            mimeType: target.mimeType,
          }
        }
      } catch {
        // fall through to the local legacy check
      }
    }

    return this.fallback.get(storedFileName)
  }

  async openRead(
    storedFileName: string
  ): Promise<{ mimeType: string; stream: Readable } | null> {
    const target = this.resolve(storedFileName)
    if (target) {
      try {
        const response = await fetch(target.deliveryUrl)
        if (response.ok && response.body) {
          return {
            mimeType: target.mimeType,
            stream: Readable.fromWeb(
              response.body as Parameters<typeof Readable.fromWeb>[0]
            ),
          }
        }
      } catch {
        // fall through to the local legacy check
      }
    }

    return this.fallback.openRead(storedFileName)
  }

  async delete(storedFileName: string): Promise<boolean> {
    const target = this.resolve(storedFileName)
    if (target) {
      try {
        const response = await fetch(
          `${this.cfg.apiBase}/v1_1/${this.cfg.cloudName}/resources/${target.resourceType}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: this.authHeader(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ public_id: target.publicId, invalidate: true }),
          }
        )

        if (response.ok) {
          const data = (await response.json().catch(() => ({}))) as {
            deleted?: Record<string, string>
          }
          if (data.deleted?.[target.publicId] === 'not found') {
            return this.fallback.delete(storedFileName)
          }
          return true
        }
      } catch {
        // fall through to the local legacy check
      }
    }

    return this.fallback.delete(storedFileName)
  }

  getUrl(storedFileName: string): string {
    return `/api/uploads/${storedFileName}`
  }
}
