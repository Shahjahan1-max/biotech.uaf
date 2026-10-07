import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  removeNotification,
} from '../controllers/notificationController.js'

const router = Router()

router.use(requireAuth)

router.get('/', listNotifications)
router.get('/unread-count', getUnreadCount)
router.put('/read-all', markAllAsRead)
router.patch('/read-all', markAllAsRead)
router.put('/:id/read', markAsRead)
router.patch('/:id/read', markAsRead)
router.delete('/:id', removeNotification)

export default router
