import { Router } from 'express'
import * as subjectController from '../controllers/subjectController'
import { requireAuth, requireRole } from '../middleware/auth'

export const subjectRoutes = Router()

subjectRoutes.get('/', requireAuth, subjectController.getSubjects)
subjectRoutes.get('/:id', requireAuth, subjectController.getSubject)
subjectRoutes.post('/', requireAuth, requireRole('ADMIN'), subjectController.createSubject)
subjectRoutes.put('/:id', requireAuth, requireRole('ADMIN'), subjectController.updateSubject)
subjectRoutes.delete('/:id', requireAuth, requireRole('ADMIN'), subjectController.deleteSubject)
