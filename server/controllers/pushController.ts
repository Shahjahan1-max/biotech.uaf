import type { Request, Response } from 'express'
import {
  PushValidationError,
  PushNotConfiguredError,
  getVapidPublicKey,
  saveSubscription,
  removeSubscription,
  validateSubscriptionPayload,
} from '../services/pushService.js'

function handleError(error: unknown, res: Response, fallback: string): void {
  if (error instanceof PushValidationError) {
    res.status(400).json({ error: error.message })
    return
  }
  if (error instanceof PushNotConfiguredError) {
    res.status(503).json({ error: error.message })
    return
  }
  console.error(error instanceof Error ? error.message : 'Push request failed')
  res.status(500).json({ error: fallback })
}

export async function getPublicKey(_req: Request, res: Response): Promise<void> {
  try {
    res.json({ publicKey: getVapidPublicKey() })
  } catch (error) {
    handleError(error, res, 'Push notifications are unavailable')
  }
}

export async function subscribe(req: Request, res: Response): Promise<void> {
  try {
    const input = validateSubscriptionPayload(req.body)
    await saveSubscription(req.user!.id, input)
    res.status(201).json({ success: true })
  } catch (error) {
    handleError(error, res, 'Failed to save push subscription')
  }
}

export async function unsubscribe(req: Request, res: Response): Promise<void> {
  try {
    const { endpoint } = req.body ?? {}

    if (endpoint !== undefined && typeof endpoint !== 'string') {
      throw new PushValidationError('Endpoint must be a string')
    }
    if (typeof endpoint === 'string' && endpoint.length > 2000) {
      throw new PushValidationError('Subscription endpoint is invalid')
    }

    const removed = await removeSubscription(req.user!.id, endpoint || undefined)
    res.json({ success: true, removed })
  } catch (error) {
    handleError(error, res, 'Failed to remove push subscription')
  }
}
