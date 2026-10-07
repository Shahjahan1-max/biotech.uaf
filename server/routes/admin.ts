import { Router } from 'express'
import * as adminDashboardController from '../controllers/adminDashboardController.js'
import * as adminStudentController from '../controllers/adminStudentController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const adminRoutes = Router()

adminRoutes.get('/dashboard', requireAuth, requireRole('ADMIN'), adminDashboardController.getDashboard)
adminRoutes.get('/students', requireAuth, requireRole('ADMIN'), adminStudentController.getStudents)
adminRoutes.patch('/students/:id/username', requireAuth, requireRole('ADMIN'), adminStudentController.updateStudentUsername)
