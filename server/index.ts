import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { routes } from './routes/index.js'

const app = express()

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api', routes)

app.use(errorHandler)

const host = config.nodeEnv === 'production' || process.env.RENDER ? '0.0.0.0' : undefined
const onListening = () => {
  console.log(`Server running on port ${config.port}`)
}

if (host) {
  app.listen(config.port, host, onListening)
} else {
  app.listen(config.port, onListening)
}
