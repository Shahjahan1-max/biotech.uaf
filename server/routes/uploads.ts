import { Router } from 'express'
import * as uploadController from '../controllers/uploadController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const uploadRoutes = Router()

uploadRoutes.post('/', requireAuth, requireRole('ADMIN'), uploadController.uploadMiddleware, uploadController.uploadFile)
uploadRoutes.get('/:filename', requireAuth, uploadController.getFile)
uploadRoutes.delete('/:filename', requireAuth, requireRole('ADMIN'), uploadController.deleteFile)
