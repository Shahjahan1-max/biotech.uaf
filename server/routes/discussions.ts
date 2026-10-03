import { Router } from 'express'
import * as discussionController from '../controllers/discussionController.js'
import { requireAuth } from '../middleware/auth.js'

export const discussionRoutes = Router()

discussionRoutes.get('/', requireAuth, discussionController.getPosts)
discussionRoutes.get('/:id', requireAuth, discussionController.getPost)
discussionRoutes.post('/', requireAuth, discussionController.createPost)
discussionRoutes.put('/:id', requireAuth, discussionController.updatePost)
discussionRoutes.delete('/:id', requireAuth, discussionController.deletePost)

discussionRoutes.get('/:id/replies', requireAuth, discussionController.getReplies)
discussionRoutes.post('/:id/replies', requireAuth, discussionController.createReply)
discussionRoutes.put('/replies/:replyId', requireAuth, discussionController.updateReply)
discussionRoutes.delete('/replies/:replyId', requireAuth, discussionController.deleteReply)
