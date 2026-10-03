import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

export const authRoutes = Router()

authRoutes.get('/me', requireAuth, authController.me)
