import { Router } from 'express'
import * as assignmentController from '../controllers/assignmentController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const assignmentRoutes = Router()

assignmentRoutes.get('/', requireAuth, assignmentController.getAssignments)
assignmentRoutes.get('/:id', requireAuth, assignmentController.getAssignment)
assignmentRoutes.post('/', requireAuth, requireRole('ADMIN'), assignmentController.createAssignment)
assignmentRoutes.put('/:id', requireAuth, requireRole('ADMIN'), assignmentController.updateAssignment)
assignmentRoutes.delete('/:id', requireAuth, requireRole('ADMIN'), assignmentController.deleteAssignment)