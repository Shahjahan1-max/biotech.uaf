import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  removeNotification,
} from '../controllers/notificationController'

const router = Router()

router.use(requireAuth)

router.get('/', listNotifications)
router.get('/unread-count', getUnreadCount)
router.put('/read-all', markAllAsRead)
router.put('/:id/read', markAsRead)
router.delete('/:id', removeNotification)

export default router
