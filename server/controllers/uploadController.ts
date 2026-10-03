import type { Request, Response } from 'express'
import path from 'path'
import multer from 'multer'
import { storageService, validateFile } from '../services/storage/index.js'
import { config } from '../config/env.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxFileSize },
})

export const uploadMiddleware = upload.single('file')

export async function uploadFile(req: Request, res: Response) {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' })
      return
    }

    const validationError = validateFile(req.file)
    if (validationError) {
      res.status(400).json({ error: validationError })
      return
    }

    const stored = await storageService.save(req.file)

    res.status(201).json({
      id: stored.id,
      originalFileName: stored.originalFileName,
      storedFileName: stored.storedFileName,
      mimeType: stored.mimeType,
      size: stored.size,
      url: storageService.getUrl(stored.storedFileName),
    })
  } catch {
    res.status(500).json({ error: 'Upload failed' })
  }
}

export async function getFile(req: Request, res: Response) {
  try {
    const { filename } = req.params
    const file = await storageService.get(filename)

    if (!file) {
      res.status(404).json({ error: 'File not found' })
      return
    }

    const safeName = path.basename(filename).replace(/["\\\r\n]/g, '')
    res.setHeader('Content-Type', file.mimeType)
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`)

    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.send(Buffer.from(file.data))
  } catch {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to retrieve file' })
    }
  }
}

export async function deleteFile(req: Request, res: Response) {
  try {
    const { filename } = req.params
    const deleted = await storageService.delete(filename)
    if (!deleted) {
      res.status(404).json({ error: 'File not found' })
      return
    }
    res.json({ message: 'File deleted successfully' })
  } catch {
    res.status(500).json({ error: 'Failed to delete file' })
  }
}
