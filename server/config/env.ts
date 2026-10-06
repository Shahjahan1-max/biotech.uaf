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

function parseCloudinaryUrl(raw: string): {
  cloudName: string
  apiKey: string
  apiSecret: string
} | null {
  try {
    const url = new URL(raw)
    if (url.protocol !== 'cloudinary:') return null
    const cloudName = url.hostname
    const apiKey = decodeURIComponent(url.username)
    const apiSecret = decodeURIComponent(url.password)
    if (!cloudName || !apiKey || !apiSecret) return null
    return { cloudName, apiKey, apiSecret }
  } catch {
    return null
  }
}

const cloudinaryFromUrl = process.env.CLOUDINARY_URL
  ? parseCloudinaryUrl(process.env.CLOUDINARY_URL)
  : null

if (process.env.CLOUDINARY_URL && !cloudinaryFromUrl) {
  throw new Error(
    'CLOUDINARY_URL must look like cloudinary://<api_key>:<api_secret>@<cloud_name>'
  )
}

function trimBase(url: string): string {
  return url.replace(/\/+$/, '')
}

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
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || cloudinaryFromUrl?.cloudName || '',
    apiKey: process.env.CLOUDINARY_API_KEY || cloudinaryFromUrl?.apiKey || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || cloudinaryFromUrl?.apiSecret || '',
    folder: process.env.CLOUDINARY_FOLDER || '',
    apiBase: trimBase(process.env.CLOUDINARY_API_BASE || 'https://api.cloudinary.com'),
    deliveryBase: trimBase(
      process.env.CLOUDINARY_DELIVERY_BASE || 'https://res.cloudinary.com'
    ),
  },
}
