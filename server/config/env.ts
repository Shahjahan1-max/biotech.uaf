import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const nodeEnv = process.env.NODE_ENV || 'development'
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production'

if (nodeEnv === 'production') {
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET === 'dev-secret-change-in-production' ||
    process.env.JWT_SECRET.length < 32
  ) {
    throw new Error(
      'JWT_SECRET must be set to a strong random value of at least 32 characters when NODE_ENV=production'
    )
  }
}

const configuredOrigin = process.env.FRONTEND_URL
const frontendUrl =
  configuredOrigin && configuredOrigin !== '*' && !configuredOrigin.includes(',')
    ? configuredOrigin
    : 'http://localhost:5173'

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  nodeEnv,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: 'biotech_session',
  uploadDir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  frontendUrl,
}
