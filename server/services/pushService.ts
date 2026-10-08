import webPush from 'web-push'
import type { PushSubscription } from '@prisma/client'
import { prisma } from '../utils/prisma.js'
import { config } from '../config/env.js'

const MAX_ENDPOINT_LENGTH = 2000
const MAX_KEY_LENGTH = 512
const MAX_PAYLOAD_BYTES = 3072

export class PushValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PushValidationError'
  }
}

export class PushNotConfiguredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PushNotConfiguredError'
  }
}

let vapidReady = false

function ensureVapidConfigured(): void {
  if (vapidReady) return
  if (!config.vapid.publicKey || !config.vapid.privateKey) {
    throw new PushNotConfiguredError('Web Push is not configured')
  }
  webPush.setVapidDetails(config.vapid.subject, config.vapid.publicKey, config.vapid.privateKey)
  vapidReady = true
}

export function getVapidPublicKey(): string {
  if (!config.vapid.publicKey) {
    throw new PushNotConfiguredError('Web Push is not configured')
  }
  return config.vapid.publicKey
}

export function isPushConfigured(): boolean {
  return Boolean(config.vapid.publicKey && config.vapid.privateKey)
}

export interface PushSubscriptionInput {
  endpoint: string
  p256dh: string
  auth: string
}

export function validateSubscriptionPayload(body: unknown): PushSubscriptionInput {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new PushValidationError('Subscription payload must be an object')
  }

  const { endpoint, p256dh, auth } = body as Record<string, unknown>

  if (typeof endpoint !== 'string' || endpoint.length === 0 || endpoint.length > MAX_ENDPOINT_LENGTH) {
    throw new PushValidationError('Subscription endpoint is invalid')
  }

  let parsed: URL
  try {
    parsed = new URL(endpoint)
  } catch {
    throw new PushValidationError('Subscription endpoint is invalid')
  }

  if (parsed.protocol !== 'https:') {
    throw new PushValidationError('Subscription endpoint must use HTTPS')
  }

  if (typeof p256dh !== 'string' || p256dh.length === 0 || p256dh.length > MAX_KEY_LENGTH) {
    throw new PushValidationError('Subscription key is invalid')
  }

  if (typeof auth !== 'string' || auth.length === 0 || auth.length > MAX_KEY_LENGTH) {
    throw new PushValidationError('Subscription auth is invalid')
  }

  return { endpoint, p256dh, auth }
}

export async function saveSubscription(
  userId: string,
  input: PushSubscriptionInput
): Promise<void> {
  await prisma.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    update: { userId, p256dh: input.p256dh, auth: input.auth },
    create: {
      userId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
    },
  })
}

export async function removeSubscription(userId: string, endpoint?: string): Promise<number> {
  const result = await prisma.pushSubscription.deleteMany({
    where: endpoint ? { userId, endpoint } : { userId },
  })
  return result.count
}

export interface PushPayload {
  title: string
  body: string
  notificationId?: string
  url?: string
  type?: string
}

export type SendOutcome = 'sent' | 'removed' | 'failed'

export type PushSender = (record: PushSubscription, body: string) => Promise<void>

const defaultSender: PushSender = async (record, body) => {
  await webPush.sendNotification(
    { endpoint: record.endpoint, keys: { p256dh: record.p256dh, auth: record.auth } },
    body
  )
}

export async function sendToSubscription(
  record: PushSubscription,
  payload: PushPayload,
  sender: PushSender = defaultSender
): Promise<SendOutcome> {
  const body = JSON.stringify(payload)
  if (Buffer.byteLength(body, 'utf8') > MAX_PAYLOAD_BYTES) {
    throw new PushValidationError('Push payload is too large')
  }

  try {
    await sender(record, body)
    return 'sent'
  } catch (error) {
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? (error as { statusCode?: number }).statusCode
        : undefined

    if (statusCode === 404 || statusCode === 410) {
      try {
        await prisma.pushSubscription.delete({ where: { id: record.id } })
      } catch {
        // already removed
      }
      return 'removed'
    }

    console.error(`Push delivery failed (status: ${statusCode ?? 'unknown'})`)
    return 'failed'
  }
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
  sender: PushSender = defaultSender
): Promise<{ sent: number; removed: number; failed: number }> {
  ensureVapidConfigured()

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } })
  let sent = 0
  let removed = 0
  let failed = 0

  for (const subscription of subscriptions) {
    const outcome = await sendToSubscription(subscription, payload, sender)
    if (outcome === 'sent') sent += 1
    else if (outcome === 'removed') removed += 1
    else failed += 1
  }

  return { sent, removed, failed }
}

export interface NotificationPushRecord {
  id: string
  userId: string
  type: string
  title: string
  message: string
  link: string | null
}

function sameOriginUrl(link: string | null): string {
  return typeof link === 'string' && link.startsWith('/') ? link : ''
}

export async function deliverNotificationPush(
  records: NotificationPushRecord[],
  sender?: PushSender
): Promise<void> {
  if (!isPushConfigured()) return

  for (const record of records) {
    try {
      await sendPushToUser(
        record.userId,
        {
          title: record.title,
          body: record.message,
          notificationId: record.id,
          url: sameOriginUrl(record.link),
          type: record.type,
        },
        sender
      )
    } catch (error) {
      console.error(
        `Push fan-out failed for notification ${record.id}:`,
        error instanceof Error ? error.message : 'unknown error'
      )
    }
  }
}
