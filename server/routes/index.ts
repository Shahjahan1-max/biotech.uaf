import { Router } from 'express'
import { authRoutes } from './auth'
import { subjectRoutes } from './subjects'
import { resourceRoutes } from './resources'
import { uploadRoutes } from './uploads'
import { assignmentRoutes } from './assignments'
import { scheduleRoutes } from './schedule'
import { discussionRoutes } from './discussions'
import { announcementRoutes } from './announcements'
import { adminRoutes } from './admin'
import notificationRoutes from './notifications'

export const routes = Router()

routes.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

routes.use('/auth', authRoutes)
routes.use('/subjects', subjectRoutes)
routes.use('/resources', resourceRoutes)
routes.use('/uploads', uploadRoutes)
routes.use('/assignments', assignmentRoutes)
routes.use('/schedule', scheduleRoutes)
routes.use('/discussions', discussionRoutes)
routes.use('/announcements', announcementRoutes)
routes.use('/admin', adminRoutes)
routes.use('/notifications', notificationRoutes)
