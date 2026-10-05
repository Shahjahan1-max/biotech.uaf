import { Router } from 'express'
import { authRoutes } from './auth.js'
import { subjectRoutes } from './subjects.js'
import { resourceRoutes } from './resources.js'
import { uploadRoutes } from './uploads.js'
import { assignmentRoutes } from './assignments.js'
import { scheduleRoutes } from './schedule.js'
import { discussionRoutes } from './discussions.js'
import { announcementRoutes } from './announcements.js'
import { adminRoutes } from './admin.js'
import notificationRoutes from './notifications.js'
import { settingsRoutes } from './settings.js'

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
routes.use('/settings', settingsRoutes)
