import express from 'express'
import { errorHandler } from './middleware/errorHandler.js'
import { routes } from './routes/index.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json())
  app.use('/api', routes)
  app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }))
  app.use(errorHandler)
  return app
}
