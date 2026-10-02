import { Router } from 'express'
import * as resourceController from '../controllers/resourceController'
import { requireAuth, requireRole } from '../middleware/auth'

export const resourceRoutes = Router()

resourceRoutes.get('/', requireAuth, resourceController.getResources)
resourceRoutes.get('/:id', requireAuth, resourceController.getResource)
resourceRoutes.post('/', requireAuth, requireRole('ADMIN'), resourceController.createResource)
resourceRoutes.put('/:id', requireAuth, requireRole('ADMIN'), resourceController.updateResource)
resourceRoutes.delete('/:id', requireAuth, requireRole('ADMIN'), resourceController.deleteResource)
