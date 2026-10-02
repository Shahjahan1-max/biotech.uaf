import { Router } from 'express'
import * as adminDashboardController from '../controllers/adminDashboardController'
import * as adminStudentController from '../controllers/adminStudentController'
import { requireAuth, requireRole } from '../middleware/auth'

export const adminRoutes = Router()

adminRoutes.get('/dashboard', requireAuth, requireRole('ADMIN'), adminDashboardController.getDashboard)
adminRoutes.get('/students', requireAuth, requireRole('ADMIN'), adminStudentController.getStudents)
