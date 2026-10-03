import { Router } from 'express'
import * as scheduleController from '../controllers/scheduleController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const scheduleRoutes = Router()

scheduleRoutes.get('/', requireAuth, scheduleController.getSchedules)
scheduleRoutes.get('/:id', requireAuth, scheduleController.getSchedule)
scheduleRoutes.post('/', requireAuth, requireRole('ADMIN'), scheduleController.createSchedule)
scheduleRoutes.put('/:id', requireAuth, requireRole('ADMIN'), scheduleController.updateSchedule)
scheduleRoutes.delete('/:id', requireAuth, requireRole('ADMIN'), scheduleController.deleteSchedule)
