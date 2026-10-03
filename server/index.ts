import { createApp } from './app.js'
import { config } from './config/env.js'

createApp().listen(config.port, () => {
  console.log(`Server running on port ${config.port}; use netlify dev for platform features`)
})
