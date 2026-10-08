import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getPublicKey, subscribe, unsubscribe } from '../controllers/pushController.js'

const router = Router()

router.get('/public-key', getPublicKey)
router.post('/subscribe', requireAuth, subscribe)
router.delete('/unsubscribe', requireAuth, unsubscribe)

export default router
