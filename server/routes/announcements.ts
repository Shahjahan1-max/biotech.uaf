import { Router } from 'express'
import * as announcementController from '../controllers/announcementController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const announcementRoutes = Router()

announcementRoutes.get('/', requireAuth, announcementController.getAnnouncements)
announcementRoutes.get('/:id', requireAuth, announcementController.getAnnouncement)
announcementRoutes.post('/', requireAuth, requireRole('ADMIN'), announcementController.createAnnouncement)
announcementRoutes.put('/:id', requireAuth, requireRole('ADMIN'), announcementController.updateAnnouncement)
announcementRoutes.delete('/:id', requireAuth, requireRole('ADMIN'), announcementController.deleteAnnouncement)
