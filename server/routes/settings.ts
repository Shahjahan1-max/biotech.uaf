import { Router } from 'express'
import * as siteSettingController from '../controllers/siteSettingController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const settingsRoutes = Router()

settingsRoutes.get('/founder', requireAuth, siteSettingController.getFounder)
settingsRoutes.patch(
  '/founder',
  requireAuth,
  requireRole('ADMIN'),
  siteSettingController.updateFounder
)
settingsRoutes.delete(
  '/founder/image',
  requireAuth,
  requireRole('ADMIN'),
  siteSettingController.removeFounderImage
)
